/* Copyright © 2026 White Eclipse. Released under the MIT License. */

export type Locale = "en" | "fr" | "de" | "ja";

/**
 * Resolves a Storybook global to one of the workspace's supported languages.
 *
 * @param value - The locale supplied by Storybook.
 * @returns A supported locale, falling back to English for unknown values.
 */
export function resolveLocale(value: unknown): Locale {
    if (value === "fr" || value === "de" || value === "ja") {
        return value;
    }
    return "en";
}
