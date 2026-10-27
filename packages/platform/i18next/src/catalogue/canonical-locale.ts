/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Gives catalogue entries and preferences the same canonical locale identity.
 *
 * @param locale - A source locale identifier.
 * @returns A canonical BCP 47 locale identifier.
 * @throws {TypeError} If the locale identifier is invalid.
 */
export function canonicalLocale(locale: string): string {
    try {
        const canonical = Intl.getCanonicalLocales(locale)[0];
        if (canonical !== undefined) {
            return canonical;
        }
    } catch (error) {
        throw new TypeError(`Invalid translation locale "${locale}".`, { cause: error });
    }

    throw new TypeError(`Invalid translation locale "${locale}".`);
}
