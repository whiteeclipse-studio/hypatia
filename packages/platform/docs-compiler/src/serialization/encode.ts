/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { randomUUIDv7 } from "node:crypto";
import type { Repository } from "../types";
import { encodeArtifact } from "./encode-artifact";
import { stringifyJson } from "./json";
import { type SerializedManifest, SerializedManifestSchema } from "./manifest";
import { SerializedPathSchema } from "./path";


/**
 * Encodes one repository's fixed inventory into the version-1 archive entry layout.
 * Uses fresh UUIDv7 storage keys independently of source paths and compiler-cache keys.
 *
 * @param repository Completed repository to encode; its caller retains lifetime ownership.
 * @param signal Optional cancellation checked between source reads and before returning entries.
 * @returns Manifest, artifact JSON, and independent binary payload entries ready for TAR encoding.
 * @rejects If cancelled, reads fail, inventory paths conflict, or data violates the stored contracts.
 */
export async function encodeRepository(
    repository: Repository,
    signal?: AbortSignal,
): Promise<Record<string, string | Blob>> {
    signal?.throwIfAborted();
    const entries = new Map<string, string | Blob>();
    const inventory = new Map<string, string>();

    for (const [path, artifact] of repository) {
        signal?.throwIfAborted();
        SerializedPathSchema.parse(path);
        if (path !== artifact.path || inventory.has(path)) {
            throw new TypeError(`Conflicting artifact path ${path} while encoding repository ${repository.id}.`);
        }
        const key = randomUUIDv7();
        entries.set(`artifacts/${key}.json`, await encodeArtifact(artifact, entries));
        inventory.set(path, key);
    }

    signal?.throwIfAborted();
    const manifest: SerializedManifest = {
        formatVersion: 1,
        repository: { id: repository.id, name: repository.name, metadata: repository.metadata },
        artifacts: Object.fromEntries(inventory),
    };

    const encodedManifest = stringifyJson(manifest);
    SerializedManifestSchema.parse(manifest);
    entries.set("manifest.json", encodedManifest);
    return Object.fromEntries(entries);
}
