/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { i18n as I18nInstance } from "i18next";
import type { TranslationCatalogue } from "../catalogue/index.ts";
import { readBrowserPreferences, selectLocale } from "../preferences/index.ts";
import { createConfiguredSession, initializeSession } from "../session/initialize-session.ts";

/** The configured browser instance; initialize once with application translations before rendering. */
export const i18n = createConfiguredSession();

/**
 * Bootstraps the browser instance from preferences or the locale used to generate the HTML.
 *
 * @param catalogue - The application's validated bundled translations.
 * @param initialLocale - The generated HTML's locale during hydration; otherwise preferences apply immediately.
 * @returns The initialized browser instance, also available through the i18n export.
 * @rejects Outside a browser, for an invalid explicit locale, or if engine initialization fails.
 */
export async function initializeBrowser(
    catalogue: TranslationCatalogue,
    initialLocale?: string,
): Promise<I18nInstance> {
    if (typeof window === "undefined") {
        throw new Error("initializeBrowser requires a browser. Use createSession for independent server renders.");
    }

    const locale = initialLocale ?? selectLocale(readBrowserPreferences(), catalogue);
    return initializeSession(i18n, catalogue, locale);
}
