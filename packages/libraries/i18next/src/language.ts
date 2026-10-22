/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { i18n } from "i18next";

const preferenceKey = "@whiteeclipse/locale";

/**
 * Reads the RFC-defined preference when browser storage is available.
 *
 * @returns The saved language, or undefined when unavailable.
 */
function readPreference(): string | undefined {
    try {
        return localStorage.getItem(preferenceKey) ?? undefined;
    } catch {
        return undefined;
    }
}

/**
 * Matches an exact regional language before trying its base language.
 *
 * @param candidate - Requested language code, including any regional suffix.
 * @param available - Application language directory names.
 * @returns The original supported language code, or undefined when unsupported.
 */
function matchLanguage(candidate: string, available: readonly string[]): string | undefined {
    const normalized = candidate.toLowerCase();
    const exact = available.find(language => language.toLowerCase() === normalized);
    if (exact !== undefined) {
        return exact;
    }
    const base = normalized.split("-")[0];
    return available.find(language => language.toLowerCase() === base);
}

/**
 * Selects saved preference, then browser language, then English without discarding regional variants.
 *
 * @param instance - Initialized instance containing the application's locale resources.
 * @returns The selected supported language, or English when none match.
 */
export function selectInitialLanguage(instance: i18n): string {
    const candidates = [readPreference()];
    if (typeof navigator !== "undefined") {
        candidates.push(...navigator.languages, navigator.language);
    }
    return resolveCandidates(instance, candidates);
}

/**
 * Resolves language candidates in preference order against loaded locale resources.
 *
 * @param instance - Initialized application instance.
 * @param candidates - Ordered language preferences.
 * @returns A supported locale or the default English language.
 */
function resolveCandidates(instance: i18n, candidates: readonly (string | undefined)[]): string {
    const available = Object.keys(instance.store.data);
    for (const candidate of candidates) {
        if (candidate !== undefined) {
            const language = matchLanguage(candidate, available);
            if (language !== undefined) {
                return language;
            }
        }
    }
    return "en";
}

/**
 * Resolves an SSR request's Accept-Language header, honoring quality and regional fallback.
 *
 * @param instance - Initialized application instance.
 * @param acceptLanguage - Request header; absent or unsupported preferences resolve to English.
 * @returns The supported request locale or English.
 */
export function selectRequestLanguage(instance: i18n, acceptLanguage?: string): string {
    const qualityOffset = 2;
    const candidates = (acceptLanguage ?? "")
        .split(",")
        .map((entry, index) => {
            const [language, ...parameters] = entry.trim().split(";");
            const quality = parameters.find(parameter => parameter.trim().startsWith("q="));
            return {
                language,
                quality: quality === undefined ? 1 : Number(quality.trim().slice(qualityOffset)),
                index,
            };
        })
        .filter(entry => Number.isFinite(entry.quality) && entry.quality > 0 && entry.quality <= 1)
        .sort((left, right) => {
            const difference = right.quality - left.quality;
            return difference === 0 ? left.index - right.index : difference;
        })
        .map(entry => entry.language);
    return resolveCandidates(instance, candidates);
}

/**
 * Persists the user's choice under the RFC-defined localStorage key.
 *
 * @param language - Active language, preserving any regional suffix.
 */
export function persistLanguage(language: string): void {
    try {
        localStorage.setItem(preferenceKey, language);
    } catch {
        // Runtime switching remains usable when browser storage is unavailable.
    }
}

/**
 * Installs browser persistence or resolves the SSR header, retaining explicit hydration snapshots.
 *
 * @param instance - Initialized translation instance.
 * @param snapshotLanguage - Optional language matching server-rendered HTML.
 * @param acceptLanguage - SSR request language preferences.
 * @returns Completion after browser preferences have been applied.
 * @rejects If the selected language cannot be activated.
 */
export async function initializeLanguage(
    instance: i18n,
    snapshotLanguage?: string,
    acceptLanguage?: string,
): Promise<void> {
    const browser = typeof window !== "undefined";
    const language =
        snapshotLanguage ??
        (browser ? selectInitialLanguage(instance) : selectRequestLanguage(instance, acceptLanguage));
    if (browser) {
        instance.on("languageChanged", persistLanguage);
    }
    if (language !== instance.language) {
        await instance.changeLanguage(language);
    }
}
