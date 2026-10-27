/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { Gzip } from "fflate";
import { extract, pack, type TarImportCandidate } from "it-tar";
import { requireCondition } from "../errors.ts";
import { archivePath, comparePaths } from "../paths.ts";
import { checkFileLimits } from "../limits.ts";
import type { DocumentationArtifact, ProcessingLimits } from "../types.ts";
import { joinBytes, readStream } from "./bytes.ts";
import { validateTarFraming } from "./framing.ts";
import { validateArtifactData } from "./validate.ts";

const compressedChunkBytes = 16_384;

/**
 * Produces deterministic TAR.GZ bytes with sorted entries and fixed timestamps.
 *
 * @param artifact - Validated in-memory artifact.
 * @param limits - Resolved resource limits.
 * @returns A gzip-compressed TAR archive.
 * @rejects For invalid file paths, archive failures, or exceeded ceilings.
 */
export async function encodeArtifact(artifact: DocumentationArtifact, limits: ProcessingLimits): Promise<Uint8Array> {
    checkFileLimits(artifact.files.values(), limits);
    const chunks: Uint8Array[] = [];
    let size = 0;
    const compressor = new Gzip({ mtime: 0 }, function compressed(chunk): void {
        size += chunk.byteLength;
        requireCondition(size <= limits.maxCompressedBytes, "Compressed artifact exceeds limit", "limits");
        chunks.push(chunk);
    });
    let expanded = 0;
    for await (const chunk of pack()(tarEntries(artifact))) {
        expanded += chunk.byteLength;
        requireCondition(expanded <= limits.maxExpandedBytes, "Expanded TAR exceeds limit", "limits");
        compressor.push(chunk);
    }
    compressor.push(new Uint8Array(), true);
    return joinBytes(chunks);
}

/**
 * Creates canonical, stable TAR entries.
 *
 * @param artifact - Artifact files to serialize.
 * @returns Entries in archive-path order.
 * @throws {DocumentationError} For unsafe file paths.
 */
function tarEntries(artifact: DocumentationArtifact): TarImportCandidate[] {
    return [...artifact.files.keys()].sort(comparePaths).map(function entry(path): TarImportCandidate {
        return {
            header: { name: archivePath(path), type: "file", mtime: new Date(0), uid: 0, gid: 0 },
            body: artifact.files.get(path) ?? new Uint8Array(),
        };
    });
}

/**
 * Decompresses, extracts, and validates a bounded artifact without writing to disk.
 *
 * @param bytes - Untrusted TAR.GZ bytes.
 * @param limits - Resolved resource limits.
 * @returns A sanitized, validated artifact.
 * @rejects For gzip, TAR, manifest, content, or resource failures.
 */
export async function decodeArtifact(bytes: Uint8Array, limits: ProcessingLimits): Promise<DocumentationArtifact> {
    requireCondition(bytes.byteLength <= limits.maxCompressedBytes, "Compressed artifact exceeds limit", "limits");
    let offset = 0;
    const input = new ReadableStream<BufferSource>({
        /**
         * Supplies bounded compressed chunks instead of expanding the entire input at once.
         *
         * @param controller - Stream controller.
         */
        pull(controller): void {
            if (offset >= bytes.length) {
                controller.close();
                return;
            }
            const end = Math.min(offset + compressedChunkBytes, bytes.length);
            controller.enqueue(new Uint8Array(bytes.subarray(offset, end)));
            offset = end;
        },
    });
    const tar = await readStream(input.pipeThrough(new DecompressionStream("gzip")), limits.maxExpandedBytes);
    validateTarFraming(tar, limits);
    const files = await extractFiles(tar, limits);
    return validateArtifactData(files, limits);
}

/**
 * Extracts regular files while checking canonical names, counts, and declared sizes.
 *
 * @param tar - A completely framed TAR.
 * @param limits - Resolved resource limits.
 * @returns The complete file collection.
 * @rejects For duplicate, conflicting, nonregular, or truncated files.
 */
async function extractFiles(tar: Uint8Array, limits: ProcessingLimits): Promise<Map<string, Uint8Array>> {
    const files = new Map<string, Uint8Array>();
    for await (const entry of extract()([tar])) {
        requireCondition(entry.header.type === "file", "Nonregular TAR entry rejected");
        const path = archivePath(entry.header.name);
        requireCondition(!files.has(path) && files.size < limits.maxFiles, `Duplicate path or file limit: ${path}`);
        requireCondition(
            Number.isSafeInteger(entry.header.size) && entry.header.size <= limits.maxFileBytes,
            "Invalid TAR file size",
        );
        const chunks: Uint8Array[] = [];
        let size = 0;
        for await (const chunk of entry.body) {
            size += chunk.length;
            requireCondition(size <= limits.maxFileBytes, "TAR file limit exceeded", "limits");
            chunks.push(chunk);
        }
        requireCondition(size === entry.header.size, `Truncated TAR file: ${path}`);
        files.set(path, joinBytes(chunks));
    }
    return files;
}
