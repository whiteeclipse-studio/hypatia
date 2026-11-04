/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import type { Artifact } from "./base.js";

import * as z from "zod";
import { isHastRoot } from "./hast.js";
import { type DocumentRevision, documentRevisionSchema } from "./revision.js";


/** A compiled canonical documentation page. */
export interface DocumentArtifact extends Artifact {
    /** @inheritDoc */
    readonly type: "document";
    /** @inheritDoc */
    readonly metadata: DocumentArtifactMetadata;

    /** @inheritDoc */
    read(): Promise<Root>;
}

/** Metadata of a canonical documentation page. */
export interface DocumentArtifactMetadata {
    /** Stable document identifier, unique within the Repository. */
    readonly id: string;
    /** Plain-text document title. */
    readonly title: string;
    /** Whether the document appears in repository navigation. */
    readonly navigable: boolean;
    /** Complete copyright and licence notice. */
    readonly copyrightAndLicence: Root;
    /** Structured document revision history. */
    readonly revisions: readonly DocumentRevision[];
}

/** Validates document metadata while preserving type-specific extensions. */
export const documentArtifactMetadataSchema = z.looseObject({
    id: z.string().min(1),
    title: z.string(),
    navigable: z.boolean(),
    copyrightAndLicence: z.custom<Root>(isHastRoot, "Expected a valid HAST root."),
    revisions: z.array(documentRevisionSchema),
});
