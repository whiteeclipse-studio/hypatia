/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { TranslationCatalogue } from "../catalogue/index.ts";
import { canonicalLocale } from "../catalogue/canonical-locale.ts";
import { baseLanguage } from "../catalogue/base-language.ts";

/**
 * Chooses the first preference with exact or base-language resources in a validated catalogue.
 *
 * @param preferences - Locale identifiers in priority order; malformed and unsupported values are skipped.
 * @param catalogue - Available translations, produced by createCatalogue.
 * @returns The canonical preferred locale, retaining its region, or English when nothing matches.
 */
export function selectLocale(preferences: readonly string[], catalogue: TranslationCatalogue): string {
    for (const preference of preferences) {
        let locale: string;
        try {
            locale = canonicalLocale(preference);
        } catch {
            continue;
        }

        if (Object.hasOwn(catalogue, locale) || Object.hasOwn(catalogue, baseLanguage(locale))) {
            return locale;
        }
    }

    return "en";
}
