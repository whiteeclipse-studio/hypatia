/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Converts a generated folder label into readable title case.
 *
 * @param segment The folder name from its logical path.
 * @returns A title with slug separators replaced by spaces and each word capitalized.
 */
export function directoryTitle(segment: string): string {
    return segment.replace(/[-_]+/g, " ").replace(/(?:^|\s)\p{L}/gu, value => value.toUpperCase());
}
