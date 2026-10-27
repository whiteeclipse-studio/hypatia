/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** A string, nested translation mapping, or translation list. */
export type TranslationValue = string | TranslationDictionary | TranslationValue[];

/** One namespace's translation entries, including plural and nested keys. */
export interface TranslationDictionary {
    [key: string]: TranslationValue;
}

/** Bundled resources indexed by BCP 47 locale and path-derived namespace. */
export type LocaleResources = Record<string, Record<string, TranslationDictionary>>;

/** Initialization inputs for a browser session or an independent server/static render. */
export interface I18nOptions {
    resources: LocaleResources;
    /** Preserves the generated locale for each consumer's initial hydration render. */
    initialLocale?: string;
    /** Request header used on the server; never reads browser preferences. */
    acceptLanguage?: string;
}
