/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { i18n } from "i18next";
import { selectLocale } from "./locale";

export const localeStorageKey = "@whiteeclipse/locale";

/**
 * Reads session preferences without requiring access to browser storage.
 *
 * @returns Saved preference followed by browser languages, or no server preferences.
 */
export function browserPreferences(): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    let saved: string | null = null;
    try {
        saved = window.localStorage.getItem(localeStorageKey);
    } catch {
        // Private browsing and storage policies must not prevent localization.
    }
    const languages = window.navigator.languages;
    const browser = languages.length > 0 ? [...languages] : [window.navigator.language];

    return saved === null ? browser : [saved, ...browser];
}

/**
 * Persists an explicit selection when storage is available.
 *
 * @param locale - The language selected for this session.
 */
export function persistLocale(locale: string): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(localeStorageKey, locale);
    } catch {
        // The selected language remains active for the current session.
    }
}

/**
 * Applies browser preferences after hydration without overwriting a saved preference.
 *
 * @param instance - The provider's initialized instance.
 * @returns Completion of any language change.
 * @rejects If i18next fails to change language.
 */
export async function applyBrowserLocale(instance: i18n): Promise<void> {
    if (typeof window === "undefined") {
        return;
    }

    const locale = selectLocale(browserPreferences(), instance.options.resources ?? {});
    if (locale !== instance.language) {
        await instance.changeLanguage(locale);
    }
}
