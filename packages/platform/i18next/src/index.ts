/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

export {
    createCatalogue,
    type CatalogueEntry,
    type Messages,
    type MessageValue,
    type TranslationCatalogue,
} from "./catalogue/index.ts";
export { createSession } from "./session/index.ts";
export {
    selectLocale,
    readBrowserPreferences,
    rememberLocale,
    localeStorageKey,
    parseAcceptLanguage,
} from "./preferences/index.ts";
export { I18nProvider, type I18nProviderProps, useLocale, useTranslation, Trans } from "./react/index.ts";
export { i18n, initializeBrowser } from "./browser/index.ts";
