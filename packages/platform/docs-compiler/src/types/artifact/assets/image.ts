/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact } from "../base.js";
import { type AssetArtifact, type AssetArtifactMetadata, AssetArtifactMetadataSchema } from "./base.js";
import { z } from "zod";


/** Image-specific metadata applied to image assets. */
export interface ImageAssetArtifactMetadata extends AssetArtifactMetadata {
    /** @inheritDoc */
    readonly mimeType: `image/${string}`;
    /** Intrinsic width in pixels. */
    readonly width?: number;
    /** Intrinsic height in pixels. */
    readonly height?: number;
}

/** An image resource. */
export interface ImageArtifact extends AssetArtifact {
    /** @inheritDoc */
    readonly metadata: ImageAssetArtifactMetadata;

    /** @inheritDoc */
    read(): Promise<Blob>;
}

/** Schema used to validate image asset metadata. */
export const ImageAssetArtifactMetadataSchema = AssetArtifactMetadataSchema.extend({
    mimeType: z.string().regex(/^image\/[a-zA-Z0-9][a-zA-Z0-9!#$&^_.+-]*(?![\s\S])/u),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
});

/**
 * Checks the asset discriminator and validates image metadata without reading contents.
 *
 * @param artifact Artifact to inspect.
 * @returns Whether the artifact is an image asset with valid metadata.
 */
export function isImageAssetArtifact(artifact: Artifact): artifact is ImageArtifact {
    return artifact.type === "asset" && ImageAssetArtifactMetadataSchema.safeParse(artifact.metadata).success;
}
