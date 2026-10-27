/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createInstance, type i18n } from "i18next";
import type { TranslationCatalogue } from "../catalogue/index.ts";
import { baseLanguage } from "../catalogue/base-language.ts";
import { canonicalLocale } from "../catalogue/canonical-locale.ts";
import { preserveRequestKey } from "./preserve-request-key.ts";

/**
 * Configures lookup behavior without reading preferences or initializing resources.
 *
 * @returns An uninitialized engine with the shared session configuration.
 */
export function createConfiguredSession(): i18n {
    return createInstance({
        lng: "en",
        defaultNS: "translation",
        load: "currentOnly",
        fallbackLng: fallbackLocales,
        postProcess: [preserveRequestKey.name],
        interpolation: { escapeValue: false },
        returnNull: false,
        returnEmptyString: false,
        initAsync: false,
    }).use(preserveRequestKey);
}

/**
 * Initializes a configured engine with its own copy of catalogue resources.
 *
 * @param instance - The configured session to initialize.
 * @param catalogue - Validated translations copied into the session's private store.
 * @param locale - The initial locale, preserving an explicit region even without resources.
 * @returns The initialized engine.
 * @rejects If locale normalization or initialization fails.
 */
export async function initializeSession(
    instance: i18n,
    catalogue: TranslationCatalogue,
    locale: string,
): Promise<i18n> {
    const language = canonicalLocale(locale);
    const namespaces = [...new Set(Object.values(catalogue).flatMap(Object.keys))];

    await instance.init({ resources: structuredClone(catalogue), lng: language, ns: namespaces });
    return instance;
}

/**
 * Supplies base-language and English fallbacks after i18next checks the active locale itself.
 *
 * @param locale - The active locale supplied by i18next, when available.
 * @returns The base language followed by English, without duplicates.
 */
function fallbackLocales(locale?: string): string[] {
    const base = baseLanguage(locale ?? "en");
    return base === "en" ? ["en"] : [base, "en"];
}
