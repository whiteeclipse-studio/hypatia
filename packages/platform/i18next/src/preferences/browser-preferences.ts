/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Browser storage location for an explicitly chosen interface locale. */
export const localeStorageKey = "@whiteeclipse/locale";

/**
 * Reads saved and navigator preferences in priority order for the locale-selection policy.
 *
 * @returns The saved preference followed by browser languages, or an empty list outside the browser.
 */
export function readBrowserPreferences(): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    let saved: string | null = null;
    try {
        saved = window.localStorage.getItem(localeStorageKey);
    } catch {
        // Denied storage access leaves navigator preferences available.
    }

    const navigator = window.navigator;
    const languages = navigator.languages.length > 0 ? [...navigator.languages] : [navigator.language];
    return saved === null ? languages : [saved, ...languages];
}

/**
 * Remembers an explicit choice after its session has changed language.
 *
 * @param locale - The active locale to save. Storage failures are ignored and never change session state.
 */
export function rememberLocale(locale: string): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(localeStorageKey, locale);
    } catch {
        // Persistence is optional when the browser denies a write.
    }
}
