/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact } from "../base.ts";
import { type AssetArtifact, type AssetArtifactMetadata, AssetArtifactMetadataSchema } from "./base.ts";
import { z } from "zod";


/** Pdf-specific metadata applied to pdf assets. */
export interface PdfAssetArtifactMetadata extends AssetArtifactMetadata {
    /** @inheritDoc */
    readonly mimeType: "application/pdf";
    /** Number of pages in the document. */
    readonly pageCount?: number;
}

/** A Portable Document Format resource. */
export interface PdfArtifact extends AssetArtifact {
    /** @inheritDoc */
    readonly metadata: PdfAssetArtifactMetadata;

    /** @inheritDoc */
    read(): Promise<Blob>;
}

/** Schema used to validate pdf asset metadata. */
export const PdfAssetArtifactMetadataSchema = AssetArtifactMetadataSchema.extend({
    mimeType: z.literal("application/pdf"),
    pageCount: z.number().int().positive().optional(),
});

/**
 * Checks the asset discriminator and validates pdf metadata without reading contents.
 *
 * @param artifact Artifact to inspect.
 * @returns Whether the artifact is a pdf asset with valid metadata.
 */
export function isPdfAssetArtifact(artifact: Artifact): artifact is PdfArtifact {
    return artifact.type === "asset" && PdfAssetArtifactMetadataSchema.safeParse(artifact.metadata).success;
}
