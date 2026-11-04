/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact, ArtifactData, ArtifactPayload } from "./base.js";
import type { AnyAssetArtifact } from "./assets/index.js";
import { type DocumentRevision, documentRevisionSchema } from "./revision.js";

import type { UnknownArtifact } from "./unknown.js";
import { isHastRoot } from "./hast.js";
import { type DocumentArtifact, type DocumentArtifactMetadata, documentArtifactMetadataSchema } from "./document.js";
import {
    type TranslationArtifact,
    type TranslationArtifactMetadata,
    translationArtifactMetadataSchema,
} from "./translation.js";


export * from "./assets/index.js";

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
