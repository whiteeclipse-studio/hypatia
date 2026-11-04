/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { randomUUID } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import type { CacheAdapter } from "@whiteeclipse/cache";
import type { ArtifactReference, AssetArtifact, LoadHookContext } from "../../types/index.js";
import { fileVersion } from "./repository/resolve.js";
import type { FilesystemRepository } from "./repository/index.js";
import { resolveAssetMetadata } from "./metadata/index.js";


/**
 * Reads one fixed source version and stores its bytes in the compiler cache.
 *
 * @param reference Versioned file reference.
 * @param repository Canonical owning directory.
 * @param context Build cancellation and compiler-owned cache.
 * @returns A raw asset with resolved metadata and a reusable payload descriptor.
 * @rejects If the file changes after resolution, reading fails, or cache writing fails.
 */
export async function loadArtifact(
    reference: ArtifactReference,
    repository: FilesystemRepository,
    context: LoadHookContext,
): Promise<AssetArtifact> {
    const file = repository.sources.get(reference.id.path);
    if (file === undefined) {
        throw new Error(`Unknown filesystem source ${reference.id.path}.`);
    }
    if ((await realpath(file)) !== file) {
        throw new Error(`Filesystem source identity changed: ${file}.`);
    }

    const bytes = await readFile(file, { signal: context.signal });
    if (fileVersion(await stat(file, { bigint: true })) !== reference.version) {
        throw new Error(`Filesystem source changed while loading: ${file}.`);
    }

    const metadata = await resolveAssetMetadata(file, bytes);
    const contents = new Blob([bytes], { type: metadata.mimeType });
    const key = randomUUID();
    await context.cache.write(key, contents);
    const cache = context.cache;
    return Object.freeze({
        path: reference.id.path,
        type: "asset",
        metadata: Object.freeze(metadata),
        payload: Object.freeze({ key, decode: (payload: Blob) => payload }),
        async read() {
            return readPayload(cache, key);
        },
    });
}

/**
 * Copies a borrowed cached payload before returning; never reloads newer disk contents.
 *
 * @param cache Shared compiler-owned storage.
 * @param key Immutable payload key.
 * @returns An independently owned Blob.
 * @rejects If the payload is missing or cannot be read.
 */
async function readPayload(cache: CacheAdapter, key: string): Promise<Blob> {
    const contents = await cache.read(key);
    if (contents === undefined) {
        throw new Error(`Filesystem payload ${key} is unavailable.`);
    }

    return new Blob([await contents.arrayBuffer()], { type: contents.type });
}
