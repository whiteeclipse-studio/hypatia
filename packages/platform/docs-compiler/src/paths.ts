/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { z } from "zod";


/** Lowercases logical paths and validates non-empty relative segments without directory traversal. */
export const LogicalPathSchema = z
    .string()
    .toLowerCase()
    .regex(
        /^(?!\.{1,2}(?:\/|$))[a-z0-9._~-]+(?:\/(?!\.{1,2}(?:\/|$))[a-z0-9._~-]+)*(?![\s\S])/u,
        "Invalid logical path: use relative segments containing letters, digits, periods, underscores, tildes, or hyphens.",
    );

/**
 * Converts separators, resolves relative-directory segments, and replaces unsupported characters with underscores.
 *
 * @param path Path to convert to a lowercase logical path.
 * @returns A logical path using the supported character set.
 * @throws {z.ZodError} If normalization leaves no logical path segments.
 */
export function toLogicalPath(path: string): string {
    const segments: string[] = [];
    for (const segment of path.toLowerCase().replace(/\\/gu, "/").split("/")) {
        if (segment === "..") {
            segments.pop();
        } else if (segment !== "" && segment !== ".") {
            segments.push(segment.replace(/[^a-z0-9._~-]/gu, "_"));
        }
    }
    return LogicalPathSchema.parse(segments.join("/"));
}

/**
 * Maps a logical path to its translation path.
 *
 * This simply pre-pends the `locale` directory, and adds the locale as an extension.
 *
 * @param path Logical path to map.
 * @param locale Locale to use.
 * @returns A translation path.
 */
export function toTranslationPath(path: string, locale: string): string {
    // -3 is the length of the ".md" string.
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return `translations/${path.slice(0, -3)}.${locale}.md`;
}
