/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { z } from "zod";
import type { ArchiveReaderConfiguration } from "./configuration";
import { readBoundedStream } from "./stream";


const BLOCK_SIZE = 512;
const END_SIZE = 1024;
const OCTAL_RADIX = 8;
const CHECKSUM_START = 148;
const CHECKSUM_END = 156;
const SPACE = 32;
const NAME_END = 100;
const PREFIX_START = 345;
const PREFIX_END = 500;
const SIZE_START = 124;
const SIZE_END = 136;
const TYPE_START = 156;
const TYPE_END = 157;
const decoder = new TextDecoder("utf-8", { fatal: true });
const storageKeySchema = z.uuidv7();

/**
 * Reads a NUL-terminated TAR header field with strict UTF-8 decoding.
 *
 * @param header One TAR header block.
 * @param start Inclusive field offset.
 * @param end Exclusive field offset.
 * @returns Field contents preceding the first NUL byte.
 */
function field(header: Uint8Array, start: number, end: number): string {
    const bytes = header.subarray(start, end);
    const nul = bytes.indexOf(0);
    return decoder.decode(nul < 0 ? bytes : bytes.subarray(0, nul));
}

/**
 * Reads a conventional octal TAR number; binary and overflow encodings are rejected.
 *
 * @param text Header field containing an octal integer.
 * @returns Non-negative safe integer.
 * @throws {TypeError} If the field is malformed or too large.
 */
function octal(text: string): number {
    if (!/^[0-7]+$/u.test(text.trim())) {
        throw new TypeError("Invalid TAR numeric field.");
    }
    const value = Number.parseInt(text.trim(), OCTAL_RADIX);
    if (!Number.isSafeInteger(value)) {
        throw new TypeError("TAR numeric field exceeds the safe integer range.");
    }
    return value;
}

/**
 * Verifies header integrity and accepts only regular files in the fixed archive layout.
 *
 * @param header Nonzero TAR header block.
 * @returns Checked pathname, byte size, and directory discriminator.
 * @throws {TypeError} If checksums, types, paths, or numeric fields are unsupported.
 */
function parseHeader(header: Uint8Array): { path: string; size: number; directory: boolean } {
    const checksum = header.reduce(
        (sum, byte, index) => sum + (index >= CHECKSUM_START && index < CHECKSUM_END ? SPACE : byte),
        0,
    );
    if (checksum !== octal(field(header, CHECKSUM_START, CHECKSUM_END))) {
        throw new TypeError("Invalid TAR header checksum.");
    }
    const name = field(header, 0, NAME_END);
    const prefix = field(header, PREFIX_START, PREFIX_END);
    const path = prefix === "" ? name : `${prefix}/${name}`;
    const size = octal(field(header, SIZE_START, SIZE_END));
    const type = field(header, TYPE_START, TYPE_END);
    const directory = type === "5";
    if (directory ? size !== 0 || (path !== "artifacts/" && path !== "payloads/") : type !== "" && type !== "0") {
        throw new TypeError(`Unsupported TAR entry ${path}.`);
    }
    if (!directory && !isEntryPath(path)) {
        throw new TypeError(`Invalid archive entry path ${path}.`);
    }
    return { path, size, directory };
}

/**
 * Checks the fixed layout without normalizing potentially malicious archive paths.
 *
 * @param path Authored TAR entry pathname.
 * @returns Whether it identifies a manifest, artifact JSON, or binary payload.
 */
function isEntryPath(path: string): boolean {
    if (path === "manifest.json") {
        return true;
    }
    if (path.startsWith("artifacts/") && path.endsWith(".json")) {
        return storageKeySchema.safeParse(path.slice("artifacts/".length, -".json".length)).success;
    }
    return path.startsWith("payloads/") && storageKeySchema.safeParse(path.slice("payloads/".length)).success;
}

/**
 * Parses bounded TAR bytes without extracting to a filesystem or following links.
 *
 * @param bytes Complete decompressed TAR bytes.
 * @param maxEntries Maximum headers, including optional layout directories.
 * @param signal Build cancellation checked between entries.
 * @returns File payloads sliced from the archive, indexed by exact entry path.
 * @throws {TypeError} If framing, paths, checksums, duplicate entries, or entry types are invalid.
 * @throws {RangeError} If the archive exceeds the entry limit.
 */
export function parseTar(
    bytes: Uint8Array<ArrayBuffer>,
    maxEntries: number,
    signal: AbortSignal,
): ReadonlyMap<string, Blob> {
    const entries = new Map<string, Blob>();
    const seen = new Set<string>();
    let offset = 0;
    while (offset + BLOCK_SIZE <= bytes.length) {
        signal.throwIfAborted();
        const header = bytes.subarray(offset, offset + BLOCK_SIZE);
        if (header.every(byte => byte === 0)) {
            validateEnd(bytes.subarray(offset));
            return entries;
        }
        const entry = parseHeader(header);
        registerEntry(entry.path, seen, maxEntries);
        const start = offset + BLOCK_SIZE;
        offset = start + Math.ceil(entry.size / BLOCK_SIZE) * BLOCK_SIZE;
        if (offset > bytes.length) {
            throw new TypeError(`Truncated TAR entry ${entry.path}.`);
        }
        if (!entry.directory) {
            entries.set(entry.path, new Blob([bytes.subarray(start, start + entry.size)]));
        }
    }
    throw new TypeError("Missing TAR end blocks.");
}

/**
 * Tracks TAR headers independently of file contents, rejecting duplicates and excess entries.
 *
 * @param path Exact entry path.
 * @param seen Previously encountered paths, including directories.
 * @param maximum Header-count limit.
 * @throws {TypeError} If an entry path occurs twice.
 * @throws {RangeError} If the entry-count limit is exceeded.
 */
function registerEntry(path: string, seen: Set<string>, maximum: number): void {
    if (seen.has(path)) {
        throw new TypeError(`Duplicate archive entry ${path}.`);
    }
    seen.add(path);
    if (seen.size > maximum) {
        throw new RangeError(`Archive exceeds its ${maximum}-entry limit.`);
    }
}

/**
 * Requires two end blocks and permits only whole zero blocks after them.
 *
 * @param remainder Bytes beginning at the first zero header.
 * @throws {TypeError} If end framing or trailing bytes are invalid.
 */
function validateEnd(remainder: Uint8Array): void {
    if (remainder.length < END_SIZE || remainder.length % BLOCK_SIZE !== 0 || remainder.some(byte => byte !== 0)) {
        throw new TypeError("Invalid TAR end blocks or trailing data.");
    }
}

/**
 * Decompresses gzip through web streams under a bound, then validates TAR framing.
 *
 * @param archive Compressed input already checked against its input-size limit.
 * @param configuration Expanded-size and entry-count bounds.
 * @param signal Build cancellation passed through decompression.
 * @returns Validated archive file entries without disk extraction.
 * @rejects If gzip or TAR is malformed, a bound is exceeded, or the build is cancelled.
 */
export async function readTar(
    archive: Blob,
    configuration: Required<ArchiveReaderConfiguration>,
    signal: AbortSignal,
): Promise<ReadonlyMap<string, Blob>> {
    const expanded = await readBoundedStream(
        archive.stream().pipeThrough(new DecompressionStream("gzip")),
        configuration.maxExpandedBytes,
        signal,
    );
    return parseTar(new Uint8Array(await expanded.arrayBuffer()), configuration.maxEntries, signal);
}
