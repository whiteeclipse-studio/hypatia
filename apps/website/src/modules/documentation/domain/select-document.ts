/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { DocumentData, PageData } from "./types";


/**
 * Selects a document variant while retaining its actual content language.
 *
 * @param page Available variants, or an unloaded page.
 * @param locale Requested interface language.
 * @returns The selected variant, including orphan translations, or undefined for a directory.
 */
export function selectDocument(
    page: PageData | undefined,
    locale: string,
): { document: DocumentData; locale: string } | undefined {
    if (page === undefined) {
        return undefined;
    }
    const candidates = [locale, locale.split("-")[0] ?? "en", "en", ...Object.keys(page.variants)];
    for (const language of candidates) {
        const document = page.variants[language];
        if (document !== undefined) {
            return { document, locale: language };
        }
    }
    return undefined;
}
