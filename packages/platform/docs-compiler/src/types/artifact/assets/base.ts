/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import * as z from "zod";
import type { Artifact } from "../base.js";


/** Metadata shared by image, video, audio, and PDF resources. */
export interface AssetArtifactMetadata {
    /** MIME type of the returned contents. */
    readonly mimeType: string;
    /** Returned Blob size in bytes, expressed as a non-negative integer. */
    readonly size: number;
}

/** Artifact that carries a non-specific asset that can be loaded and managed by the reader. */
export interface AssetArtifact extends Artifact {
    /** @inheritDoc */
    readonly type: "asset";
    /** @inheritDoc */
    readonly metadata: AssetArtifactMetadata;
    /** @inheritDoc */
    read(): Promise<Blob>;
}

/** Schema used to validate asset metadata. */
export const AssetArtifactMetadataSchema = z.looseObject({
    mimeType: z.string().min(1),
    size: z.number().int().nonnegative(),
});
