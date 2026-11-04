/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import { z } from "zod";
import {
    type ArtifactData,
    type AssetArtifactMetadata,
    AssetArtifactMetadataSchema,
    type DocumentArtifactMetadata,
    documentArtifactMetadataSchema,
    isHastRoot,
    type TranslationArtifactMetadata,
    translationArtifactMetadataSchema,
} from "../types/index.js";
import { SerializedPathSchema } from "./path.js";


/** Canonical document stored completely in its artifacts/<key>.json entry. */
export interface SerializedDocumentArtifact extends ArtifactData {
    /** Document discriminator retained from the runtime artifact. */
    readonly type: "document";
    /** Document identity, navigation, notice, and revision metadata encoded as JSON. */
    readonly metadata: DocumentArtifactMetadata;
    /** Article HAST stored inline, independently of its notice and revision metadata. */
    readonly content: Root;
}

/** Translation stored completely in its artifacts/<key>.json entry. */
export interface SerializedTranslationArtifact extends ArtifactData {
    /** Translation discriminator retained from the runtime artifact. */
    readonly type: "translation";
    /** Translation identity, source, locale, notice, and revision metadata encoded as JSON. */
    readonly metadata: TranslationArtifactMetadata;
    /** Translated article HAST stored inline. */
    readonly content: Root;
}

/** JSON asset description referencing a separate binary archive entry. */
export interface SerializedAssetArtifact extends ArtifactData {
    /** Asset discriminator; specialized resources retain their MIME type in metadata. */
    readonly type: "asset";
    /** MIME type, byte length, and any JSON resource-specific extensions. */
    readonly metadata: AssetArtifactMetadata;
    /** UUIDv7 identifying the binary file at payloads/<key>. */
    readonly payload: string;
}

/** Metadata-only record for an artifact without interpreted contents. */
export interface SerializedUnknownArtifact extends ArtifactData {
    /** Unknown discriminator; no content or payload reference is stored. */
    readonly type: "unknown";
}

/** Supported archive records, discriminated by artifact type. */
export type SerializedArtifact =
    SerializedDocumentArtifact | SerializedTranslationArtifact | SerializedAssetArtifact | SerializedUnknownArtifact;

/** Validates a HAST root and requires all tree data to be representable as JSON. */
const serializedContentSchema = z.custom<Root>(isHastRoot, "Expected a valid HAST root.").and(z.json());

/** Validates complete document JSON without permitting an external payload reference. */
export const SerializedDocumentArtifactSchema = z.strictObject({
    path: SerializedPathSchema,
    type: z.literal("document"),
    metadata: documentArtifactMetadataSchema.and(z.json()),
    content: serializedContentSchema,
}) satisfies z.ZodType<SerializedDocumentArtifact>;

/** Validates complete translation JSON without requiring its canonical source to exist. */
export const SerializedTranslationArtifactSchema = z.strictObject({
    path: SerializedPathSchema,
    type: z.literal("translation"),
    metadata: translationArtifactMetadataSchema.and(z.json()),
    content: serializedContentSchema,
}) satisfies z.ZodType<SerializedTranslationArtifact>;

/** Validates an asset's JSON description and required UUIDv7 binary payload reference. */
export const SerializedAssetArtifactSchema = z.strictObject({
    path: SerializedPathSchema,
    type: z.literal("asset"),
    metadata: AssetArtifactMetadataSchema.and(z.json()),
    payload: z.uuidv7(),
}) satisfies z.ZodType<SerializedAssetArtifact>;

/** Validates metadata-only unknown records, rejecting content and payload fields. */
export const SerializedUnknownArtifactSchema = z.strictObject({
    path: SerializedPathSchema,
    type: z.literal("unknown"),
    metadata: z.json(),
}) satisfies z.ZodType<SerializedUnknownArtifact>;

/** Validates the supported serialized artifact variants without rewriting their paths. */
export const SerializedArtifactSchema = z.discriminatedUnion("type", [
    SerializedDocumentArtifactSchema,
    SerializedTranslationArtifactSchema,
    SerializedAssetArtifactSchema,
    SerializedUnknownArtifactSchema,
]) satisfies z.ZodType<SerializedArtifact>;
