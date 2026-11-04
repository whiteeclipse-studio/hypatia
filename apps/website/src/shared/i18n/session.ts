/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createSession } from "@whiteeclipse/i18next";
import catalogue from "virtual:whiteeclipse-locales";


export { catalogue };

/**
 * Creates an isolated localization session for an independent render.
 *
 * @param locale The locale value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
export async function createWebsiteSession(locale: string): ReturnType<typeof createSession> {
    return createSession(catalogue, locale);
}

/**
 * Makes content languages selectable while interface messages fall back to English.
 *
 * @param locales Languages supplied by application content.
 * @returns The interface catalogue extended with content-only locales.
 */
export function withContentLocales(locales: readonly string[]): typeof catalogue {
    const result = { ...catalogue };
    for (const locale of locales) {
        result[locale] ??= {};
    }
    return result;
}
