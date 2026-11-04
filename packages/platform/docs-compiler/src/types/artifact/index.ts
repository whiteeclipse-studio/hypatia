/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact, ArtifactData, ArtifactPayload } from "./base.ts";
import type { AnyAssetArtifact } from "./assets";
import { type DocumentRevision, documentRevisionSchema } from "./revision.ts";

import type { UnknownArtifact } from "./unknown.ts";
import { isHastRoot } from "./hast.ts";
import { type DocumentArtifact, type DocumentArtifactMetadata, documentArtifactMetadataSchema } from "./document.ts";
import {
    type TranslationArtifact,
    type TranslationArtifactMetadata,
    translationArtifactMetadataSchema,
} from "./translation.ts";


export * from "./assets/index.ts";

export type {
    Artifact,
    ArtifactData,
    ArtifactPayload,
    UnknownArtifact,
    DocumentArtifact,
    DocumentArtifactMetadata,
    TranslationArtifact,
    TranslationArtifactMetadata,
    DocumentRevision,
};

/** Union of all supported standard Artifact types, discriminated by type. */
export type AnyArtifact = UnknownArtifact | DocumentArtifact | TranslationArtifact | AnyAssetArtifact;

export { documentArtifactMetadataSchema };
export { translationArtifactMetadataSchema };
export { documentRevisionSchema };
export { isHastRoot };
