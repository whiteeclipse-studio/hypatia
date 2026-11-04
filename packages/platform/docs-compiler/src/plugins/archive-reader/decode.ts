/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import { copyMetadata } from "../../compiler/snapshot/metadata.js";
import {
    type SerializedArtifact,
    SerializedArtifactSchema,
    SerializedDocumentArtifactSchema,
} from "../../serialization/artifact.js";
import { type SerializedManifest, SerializedManifestSchema } from "../../serialization/manifest.js";
import type { AnyArtifact, LoadHookContext, Repository } from "../../types/index.js";


/** A completely validated inventory, before any compiler cache writes. */
interface DecodedArchive {
    /** Checked repository properties and inventory keys. */
    readonly manifest: SerializedManifest;
    /** Checked JSON records, ordered independently of the manifest. */
    readonly records: readonly SerializedArtifact[];
}

/**
 * Reads a required archive entry without treating missing bytes as an empty file.
 *
 * @param entries Checked TAR entries.
 * @param path Exact entry pathname.
 * @returns Existing entry payload.
 * @throws {TypeError} If a required entry is missing.
 */
function requiredEntry(entries: ReadonlyMap<string, Blob>, path: string): Blob {
    const entry = entries.get(path);
    if (entry === undefined) {
        throw new TypeError(`Missing archive entry ${path}.`);
    }
    return entry;
}

/**
 * Validates every record and cross-entry reference before caching any content.
 *
 * @param entries Files from the validated TAR layout.
 * @param signal Build cancellation checked between JSON reads.
 * @returns Complete manifest and record inventory.
 * @rejects If JSON, schemas, paths, references, or binary lengths disagree.
 */
async function validateArchive(entries: ReadonlyMap<string, Blob>, signal: AbortSignal): Promise<DecodedArchive> {
    const manifest = SerializedManifestSchema.parse(await readJson(requiredEntry(entries, "manifest.json")));
    const used = new Set(["manifest.json"]);
    const records: SerializedArtifact[] = [];
    for (const [path, key] of Object.entries(manifest.artifacts)) {
        signal.throwIfAborted();
        const entry = `artifacts/${key}.json`;
        const record = SerializedArtifactSchema.parse(await readJson(requiredEntry(entries, entry)));
        if (record.path !== path) {
            throw new TypeError(`Archive artifact path disagrees with manifest: ${path}.`);
        }
        used.add(entry);
        validatePayload(record, entries, used);
        records.push(record);
    }
    if (used.size !== entries.size) {
        throw new TypeError("Archive contains entries outside its manifest inventory.");
    }
    signal.throwIfAborted();
    return { manifest, records };
}

/**
 * Decodes JSON without silently replacing malformed UTF-8 bytes.
 *
 * @param contents JSON entry bytes.
 * @returns Parsed JSON value for subsequent schema validation.
 * @rejects If UTF-8 decoding or JSON parsing fails.
 */
async function readJson(contents: Blob): Promise<unknown> {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await contents.arrayBuffer()));
}

/**
 * Validates a referenced binary entry and its byte length without interpreting asset bytes.
 *
 * @param record Checked artifact JSON.
 * @param entries Archive files.
 * @param used Referenced entry paths accumulated for the manifest inventory.
 * @throws {TypeError} If an asset payload is absent or its size disagrees with metadata.
 */
function validatePayload(record: SerializedArtifact, entries: ReadonlyMap<string, Blob>, used: Set<string>): void {
    if (record.type === "asset") {
        const path = `payloads/${record.payload}`;
        const contents = requiredEntry(entries, path);
        if (
            contents.size !== record.metadata.size ||
            new Blob([], { type: record.metadata.mimeType }).type !== record.metadata.mimeType
        ) {
            throw new TypeError(`Archive asset contents disagree with metadata for ${record.path}.`);
        }
        used.add(path);
    }
}

/**
 * Reconstructs a validated repository using only compiler-owned immutable cache keys.
 *
 * @param entries Validated TAR file entries.
 * @param context Build lifetime, cancellation, and shared cache.
 * @returns Immutable inventory whose reads never refetch its source archive.
 * @rejects If validation, cancellation, or cache writes fail.
 */
export async function decodeRepository(
    entries: ReadonlyMap<string, Blob>,
    context: LoadHookContext,
): Promise<Repository> {
    const { manifest, records } = await validateArchive(entries, context.signal);
    const artifacts = new Map<string, AnyArtifact>();
    for (const record of records) {
        context.signal.throwIfAborted();
        artifacts.set(record.path, await createArtifact(record, entries, context));
    }
    context.signal.throwIfAborted();
    return Object.freeze({
        ...manifest.repository,
        metadata: copyMetadata(manifest.repository.metadata),
        getArtifact: (path: string) => artifacts.get(path),
        [Symbol.iterator]: () => artifacts.entries(),
    });
}

/**
 * Caches content under a fresh runtime key, independent of untrusted archive storage keys.
 *
 * @param record Fully checked artifact description.
 * @param entries Checked payload entries.
 * @param context Compiler-owned cache services.
 * @returns Artifact with independent content reads and a watch-reusable payload descriptor.
 * @rejects If cache writing fails.
 */
async function createArtifact(
    record: SerializedArtifact,
    entries: ReadonlyMap<string, Blob>,
    context: LoadHookContext,
): Promise<AnyArtifact> {
    if (record.type === "unknown") {
        return Object.freeze({
            path: record.path,
            type: "unknown",
            metadata: copyMetadata(record.metadata),
            async read() {
                await Promise.resolve();
                return undefined;
            },
        });
    }
    const key = crypto.randomUUID();
    const contents =
        record.type === "asset"
            ? requiredEntry(entries, `payloads/${record.payload}`).slice(0, undefined, record.metadata.mimeType)
            : new Blob([JSON.stringify(record.content)], { type: "application/json" });
    await context.cache.write(key, contents);
    const cache = context.cache;
    /**
     * Consumes borrowed cached bytes and returns an independent copy.
     *
     * @returns Newly owned Blob retaining its MIME type.
     * @rejects If the fixed cache payload is unavailable or reading fails.
     */
    const read = async () => {
        const payload = await cache.read(key);
        if (payload === undefined) {
            throw new Error(`Archive payload ${key} is unavailable.`);
        }
        return new Blob([await payload.arrayBuffer()], { type: payload.type });
    };
    switch (record.type) {
        case "asset":
            return Object.freeze({
                path: record.path,
                type: "asset",
                metadata: copyMetadata(record.metadata),
                payload: Object.freeze({ key, decode: copyBlob }),
                read,
            });
        case "document":
            return Object.freeze({
                path: record.path,
                type: "document",
                metadata: copyMetadata(record.metadata),
                payload: Object.freeze({ key, decode: readTree }),
                async read() {
                    return readTree(await read());
                },
            });
        case "translation":
            return Object.freeze({
                path: record.path,
                type: "translation",
                metadata: copyMetadata(record.metadata),
                payload: Object.freeze({ key, decode: readTree }),
                async read() {
                    return readTree(await read());
                },
            });
    }
}

/**
 * Copies an asset payload without borrowing cached Blob storage.
 *
 * @param contents Borrowed cached asset bytes.
 * @returns Independent Blob with its stored MIME type.
 * @rejects If reading the borrowed Blob fails.
 */
async function copyBlob(contents: Blob): Promise<Blob> {
    return new Blob([await contents.arrayBuffer()], { type: contents.type });
}

/**
 * Decodes an independent tree from previously validated, immutable cache bytes.
 *
 * @param contents Cached inline HAST JSON.
 * @returns Fresh HAST root.
 * @rejects If cached JSON or HAST is malformed.
 */
async function readTree(contents: Blob): Promise<Root> {
    return SerializedDocumentArtifactSchema.shape.content.parse(await readJson(contents));
}
