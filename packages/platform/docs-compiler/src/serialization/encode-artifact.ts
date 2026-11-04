/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { randomUUIDv7 } from "node:crypto";
import type { AnyArtifact, AssetArtifact } from "../types/index.js";
import { type SerializedArtifact, SerializedArtifactSchema, type SerializedAssetArtifact } from "./artifact.js";
import { stringifyJson } from "./json.js";


/**
 * Creates an asset description and stores its raw bytes under a fresh UUIDv7 key.
 *
 * @param artifact Binary asset whose read result must match its metadata.
 * @param entries Archive entries receiving the independent payload.
 * @returns The JSON description referencing the binary archive entry.
 * @rejects If reading fails or the returned Blob disagrees with its MIME type or byte size.
 */
async function encodeAsset(
    artifact: AssetArtifact,
    entries: Map<string, string | Blob>,
): Promise<SerializedAssetArtifact> {
    const contents = await artifact.read();
    if (
        !(contents instanceof Blob) ||
        contents.size !== artifact.metadata.size ||
        contents.type !== artifact.metadata.mimeType
    ) {
        throw new TypeError(`Asset contents disagree with metadata for ${artifact.path}.`);
    }
    const payload = randomUUIDv7();
    entries.set(`payloads/${payload}`, contents);
    return { path: artifact.path, type: "asset", metadata: artifact.metadata, payload };
}

/**
 * Converts a runtime artifact into its JSON record without serializing methods or cache keys.
 *
 * @param artifact Completed artifact selected by the repository inventory.
 * @param entries Archive entries receiving any binary payload.
 * @returns The validated artifact record encoded as compact JSON.
 * @rejects If reading or validation fails or JSON would lose data.
 */
export async function encodeArtifact(artifact: AnyArtifact, entries: Map<string, string | Blob>): Promise<string> {
    const record = await createRecord(artifact, entries);
    const encoded = stringifyJson(record);
    SerializedArtifactSchema.parse(record);
    return encoded;
}

/**
 * Reads inline article contents or captures a binary asset's external payload reference.
 * Unknown records retain metadata only and do not request contents.
 *
 * @param artifact Runtime artifact to encode.
 * @param entries Archive entries receiving any binary payload.
 * @returns The type-specific serialized record.
 * @rejects If reading fails or asset metadata disagrees with its contents.
 */
async function createRecord(artifact: AnyArtifact, entries: Map<string, string | Blob>): Promise<SerializedArtifact> {
    switch (artifact.type) {
        case "document":
            return {
                path: artifact.path,
                type: artifact.type,
                metadata: artifact.metadata,
                content: await artifact.read(),
            };
        case "translation":
            return {
                path: artifact.path,
                type: artifact.type,
                metadata: artifact.metadata,
                content: await artifact.read(),
            };
        case "asset":
            return encodeAsset(artifact, entries);
        case "unknown":
            return { path: artifact.path, type: artifact.type, metadata: artifact.metadata };
    }
}
