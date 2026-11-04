/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Encodes JSON data while rejecting values that would change or disappear on a round trip.
 *
 * @param value Metadata or an archive record containing only JSON-representable data.
 * @returns Compact JSON preserving the represented value.
 * @throws {TypeError} If encoding fails or JSON cannot preserve the value.
 */
export function stringifyJson(value: unknown): string {
    return JSON.stringify(value, null, 4);
}
