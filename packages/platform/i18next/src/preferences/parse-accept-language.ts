/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** One request preference with a positive HTTP quality weight. */
interface WeightedPreference {
    readonly locale: string;
    readonly quality: number;
}

/**
 * Converts an Accept-Language header into ordered inputs for the locale-selection policy.
 *
 * @param header - The request header, including null or undefined when absent.
 * @returns Preferences ordered by descending quality, preserving header order for equal weights.
 */
export function parseAcceptLanguage(header?: string | null): string[] {
    const preferences = (header ?? "")
        .split(",")
        .map(parsePreference)
        .filter(preference => preference !== undefined);

    preferences.sort((left, right) => right.quality - left.quality);
    return preferences.map(preference => preference.locale);
}

/**
 * Reads a language range and its optional weight, excluding malformed or zero-quality entries.
 *
 * @param entry - One comma-delimited header entry.
 * @returns Its locale and weight, or undefined when the entry is empty, excluded, or malformed.
 */
function parsePreference(entry: string): WeightedPreference | undefined {
    const [range = "", weight, ...extra] = entry.split(";");
    const locale = range.trim();
    if (locale.length === 0 || extra.length > 0) {
        return undefined;
    }

    const quality = parseQuality(weight);
    if (quality === 0) {
        return undefined;
    }

    return { locale, quality };
}

/**
 * Reads a quality value from zero to one with at most three decimal places.
 *
 * @param weight - The optional q parameter, allowing surrounding whitespace and case-insensitive parameter names.
 * @returns One when no weight is supplied, or zero for excluded or invalid weights.
 */
function parseQuality(weight?: string): number {
    if (weight === undefined) {
        return 1;
    }

    const match = /^q[\t ]*=[\t ]*(?<quality>0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/iu.exec(weight.trim());
    return Number(match?.groups?.["quality"] ?? 0);
}
