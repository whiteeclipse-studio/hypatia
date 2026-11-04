/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact } from "../base.js";
import { type AssetArtifact, type AssetArtifactMetadata, AssetArtifactMetadataSchema } from "./base.js";
import { z } from "zod";


/** Audio-specific metadata applied to audio assets. */
export interface AudioAssetArtifactMetadata extends AssetArtifactMetadata {
    /** @inheritDoc */
    readonly mimeType: `audio/${string}`;
    /** Duration in seconds. */
    readonly duration?: number;
}

/** An audio resource. */
export interface AudioArtifact extends AssetArtifact {
    /** @inheritDoc */
    readonly metadata: AudioAssetArtifactMetadata;

    /** @inheritDoc */
    read(): Promise<Blob>;
}

/** Schema used to validate audio asset metadata. */
export const AudioAssetArtifactMetadataSchema = AssetArtifactMetadataSchema.extend({
    mimeType: z.string().regex(/^audio\/[a-zA-Z0-9][a-zA-Z0-9!#$&^_.+-]*(?![\s\S])/u),
    duration: z.number().nonnegative().optional(),
});

/**
 * Checks the asset discriminator and validates audio metadata without reading contents.
 *
 * @param artifact Artifact to inspect.
 * @returns Whether the artifact is an audio asset with valid metadata.
 */
export function isAudioAssetArtifact(artifact: Artifact): artifact is AudioArtifact {
    return artifact.type === "asset" && AudioAssetArtifactMetadataSchema.safeParse(artifact.metadata).success;
}
