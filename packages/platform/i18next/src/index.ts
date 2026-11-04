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
} from "./catalogue/index.js";
export { createSession } from "./session/index.js";
export {
    selectLocale,
    readBrowserPreferences,
    rememberLocale,
    localeStorageKey,
    parseAcceptLanguage,
} from "./preferences/index.js";
export { I18nProvider, type I18nProviderProps, useLocale, useTranslation, Trans } from "./react/index.js";
export { i18n, initializeBrowser } from "./browser/index.js";
