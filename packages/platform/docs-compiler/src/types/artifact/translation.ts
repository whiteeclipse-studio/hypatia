/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import type { Artifact } from "./base.ts";

import * as z from "zod";
import { isHastRoot } from "./hast.ts";
import { type DocumentRevision, documentRevisionSchema } from "./revision.ts";


/** A translated documentation page, retained even when its source is absent. */
export interface TranslationArtifact extends Artifact {
    /** @inheritDoc */
    readonly type: "translation";
    /** @inheritDoc */
    readonly metadata: TranslationArtifactMetadata;

    /** @inheritDoc */
    read(): Promise<Root>;
}

/** Metadata of a translated documentation page. */
export interface TranslationArtifactMetadata {
    /** Stable translation identifier, unique within the Repository. */
    readonly id: string;
    /** Plain-text translated title. */
    readonly title: string;
    /** Canonical document identifier; that document can be absent. */
    readonly sourceId: string;
    /** Canonical BCP 47 language tag. */
    readonly locale: string;
    /** Complete translated copyright and licence notice. */
    readonly copyrightAndLicence: Root;
    /** The translation's own revision history. */
    readonly revisions: readonly DocumentRevision[];
}

/**
 * Checks that a locale is already in its canonical BCP 47 form.
 *
 * @param locale Translation language tag.
 * @returns Whether the runtime recognizes the tag in canonical form.
 */
function isCanonicalLocale(locale: string): boolean {
    try {
        return Intl.getCanonicalLocales(locale)[0] === locale;
    } catch {
        return false;
    }
}

/** Validates translation metadata independently of canonical-source availability. */
export const translationArtifactMetadataSchema = z.looseObject({
    id: z.string().min(1),
    title: z.string(),
    sourceId: z.string().min(1),
    locale: z.string().refine(isCanonicalLocale, "Expected a valid BCP 47 language tag."),
    copyrightAndLicence: z.custom<Root>(isHastRoot, "Expected a valid HAST root."),
    revisions: z.array(documentRevisionSchema),
});
