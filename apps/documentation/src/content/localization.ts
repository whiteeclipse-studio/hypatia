/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { DocumentSummary } from "./types";

/**
 * Chooses an exact translation, then its base language, then the canonical English source.
 *
 * @param documents - Available variants of one canonical document.
 * @param language - Requested interface or document locale.
 * @returns The best available variant, or undefined when no English source exists.
 */
export function selectTranslation<T extends DocumentSummary>(documents: readonly T[], language: string): T | undefined {
    const requested = language.toLowerCase();
    const candidates = [requested, requested.split("-")[0], "en"];
    for (const candidate of candidates) {
        const document = documents.find(entry => entry.language.toLowerCase() === candidate);
        if (document !== undefined) {
            return document;
        }
    }
    return undefined;
}

/**
 * Groups a document with the translations mapped to its English source path.
 *
 * @param documents - Complete publication index.
 * @param canonicalPath - English path relative to docs.
 * @param repository - Source repository identity; variants never cross repository boundaries.
 * @returns The English source and all published translations in deterministic order.
 */
export function documentVariants(
    documents: readonly DocumentSummary[],
    canonicalPath: string,
    repository: string,
): DocumentSummary[] {
    return documents.filter(document => document.repository === repository && document.canonicalPath === canonicalPath);
}
