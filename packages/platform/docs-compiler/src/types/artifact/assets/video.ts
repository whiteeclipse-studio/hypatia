/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact } from "../base.ts";
import { type AssetArtifact, type AssetArtifactMetadata, AssetArtifactMetadataSchema } from "./base.ts";
import { z } from "zod";


/** Video-specific metadata applied to video assets. */
export interface VideoAssetArtifactMetadata extends AssetArtifactMetadata {
    /** @inheritDoc */
    readonly mimeType: `video/${string}`;
    /** Intrinsic width in pixels. */
    readonly width?: number;
    /** Intrinsic height in pixels. */
    readonly height?: number;
    /** Duration in seconds. */
    readonly duration?: number;
}

/** A video resource. */
export interface VideoArtifact extends AssetArtifact {
    /** @inheritDoc */
    readonly metadata: VideoAssetArtifactMetadata;

    /** @inheritDoc */
    read(): Promise<Blob>;
}

/** Schema used to validate video asset metadata. */
export const VideoAssetArtifactMetadataSchema = AssetArtifactMetadataSchema.extend({
    mimeType: z.string().regex(/^video\/[a-zA-Z0-9][a-zA-Z0-9!#$&^_.+-]*(?![\s\S])/u),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration: z.number().nonnegative().optional(),
});

/**
 * Checks the asset discriminator and validates video metadata without reading contents.
 *
 * @param artifact Artifact to inspect.
 * @returns Whether the artifact is a video asset with valid metadata.
 */
export function isVideoAssetArtifact(artifact: Artifact): artifact is VideoArtifact {
    return artifact.type === "asset" && VideoAssetArtifactMetadataSchema.safeParse(artifact.metadata).success;
}
