/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Normalizes a BCP 47 locale, ignoring malformed preference values.
 *
 * @param locale - A saved, browser, or request locale.
 * @returns The canonical locale, or undefined for invalid input.
 */
export function normalizeLocale(locale: string): string | undefined {
    try {
        return Intl.getCanonicalLocales(locale)[0];
    } catch {
        return undefined;
    }
}

/**
 * Chooses the first preference with exact or base-language resources.
 *
 * @param preferences - Locale candidates in priority order.
 * @param resources - Available locale data.
 * @returns The supported preference, retaining its region, or English.
 */
export function selectLocale(preferences: readonly string[], resources: Readonly<Record<string, unknown>>): string {
    for (const preference of preferences) {
        const locale = normalizeLocale(preference);
        if (locale === undefined) {
            continue;
        }
        const base = locale.split("-")[0] ?? locale;
        if (hasResources(locale, resources) || hasResources(base, resources)) {
            return locale;
        }
    }
    return "en";
}

/**
 * Checks for at least one namespace in a locale, excluding inherited keys.
 *
 * @param locale - Locale to inspect.
 * @param resources - Available locale data.
 * @returns Whether the locale has resources.
 */
function hasResources(locale: string, resources: Readonly<Record<string, unknown>>): boolean {
    const namespaces = resources[locale];
    return (
        Object.hasOwn(resources, locale) &&
        typeof namespaces === "object" &&
        namespaces !== null &&
        Object.keys(namespaces).length > 0
    );
}

/**
 * Parses weighted Accept-Language ranges; invalid and excluded ranges are ignored.
 *
 * @param header - The request header, if supplied.
 * @returns Locale preferences ordered by descending quality and original order.
 */
export function headerPreferences(header = ""): string[] {
    const ranges = header.split(",").map(parseRange);
    ranges.sort((left, right) => right.quality - left.quality);
    return ranges.filter(range => range.quality > 0).map(range => range.locale);
}

/**
 * Reads a single language range without treating malformed weights as preferences.
 *
 * @param range - One comma-delimited header entry.
 * @returns Its locale and quality; zero quality excludes the entry.
 */
function parseRange(range: string): { locale: string; quality: number } {
    const [locale = "", ...parameters] = range.trim().split(";");
    const weight = parameters.find(parameter => parameter.trim().startsWith("q="));
    if (weight === undefined) {
        return { locale: locale.trim(), quality: 1 };
    }
    const value = weight.trim().slice("q=".length);
    const valid = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/u.test(value);
    return { locale: locale.trim(), quality: valid ? Number(value) : 0 };
}
