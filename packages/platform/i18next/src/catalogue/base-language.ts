/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Reads the base language shared by a locale's regional and script variants.
 *
 * @param locale - A valid locale identifier.
 * @returns The base language identifier.
 * @throws {RangeError} If the locale identifier is malformed.
 */
export function baseLanguage(locale: string): string {
    return new Intl.Locale(locale).language;
}
