/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { Entry, ProjectIndex } from "./types";


/**
 * Returns the documentation folder's entry route for project navigation.
 *
 * @param project Project identifier.
 * @returns The route corresponding to docs/README.md.
 */
export function projectHome(project: string): string {
    return documentRoute(project, "docs/readme.md");
}

/**
 * Maps a logical Markdown path to its canonical website route.
 *
 * @param project The project value.
 * @param path The path value.
 * @returns The prepared result.
 */
export function documentRoute(project: string, path: string): string {
    let suffix = path.replace(/(?<prefix>^|\/)readme\.md$/, "$<prefix>").replace(/\.md$/, "");
    suffix = suffix.replace(/\/$/, "");
    return `/${project}/${suffix}${suffix === "" ? "" : "/"}`;
}
/**
 * Normalizes and validates a requested website path.
 *
 * @param path The path value.
 * @returns The prepared result.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export function normalizedRoute(path: string): string {
    const decoded = decodeURIComponent(path);
    if (
        decoded.includes("\\") ||
        decoded.includes("\0") ||
        decoded.split("/").some(part => part === "." || part === "..")
    ) {
        throw new Error("Invalid documentation route.");
    }
    return `${decoded.replace(/\/+$/, "")}/`;
}
/**
 * Resolves a document translation using locale and English fallback.
 *
 * @param index The index value.
 * @param entry The entry value.
 * @param locale The locale value.
 * @returns The prepared result.
 */
export function translatedEntry(index: ProjectIndex, entry: Entry, locale: string): Entry {
    const id = entry.sourceId ?? entry.id;
    const candidates = [locale, locale.split("-")[0], "en"];
    for (const language of candidates) {
        const match = index.entries.find(item => (item.sourceId ?? item.id) === id && item.locale === language);
        if (match !== undefined) {
            return match;
        }
    }
    return entry;
}
/**
 * Compiler links already use repository-root logical paths.
 *
 * @param index The index value.
 * @param value The value value.
 * @param locale The locale value.
 * @returns The prepared result.
 */
export function destination(index: ProjectIndex, value: string, locale: string): string | undefined {
    if (value.includes("\\")) {
        return undefined;
    }
    if (value.startsWith("#")) {
        return value.startsWith("#doc-") ? value : `#doc-${value.slice(1)}`;
    }
    if (/^(?:https?:|mailto:|tel:)/i.test(value)) {
        return value;
    }
    const end = value.search(/[?#]/);
    const path = end < 0 ? value : value.slice(0, end);
    const suffix = end < 0 ? "" : value.slice(end);
    const entry = index.entries.find(item => item.path === path);
    if (entry !== undefined) {
        return translatedEntry(index, entry, locale).route + suffix.replace(/#(?!doc-)/, "#doc-");
    }
    const asset = index.assets[path];
    if (asset !== undefined) {
        return asset + suffix;
    }
    // Website-root links are permitted, arbitrary protocols and unresolved source paths are not.
    if (value.startsWith("/") && !value.startsWith("//")) {
        return value;
    }
    return undefined;
}
/**
 * Enumerates directories requiring generated overview pages.
 *
 * @param index The index value.
 * @returns The prepared result.
 */
export function directoryRoutes(index: ProjectIndex): string[] {
    const result = new Set<string>([`/${index.project.id}/`]);
    for (const entry of index.entries) {
        const segments = entry.route.split("/").filter(Boolean);
        for (let count = 1; count < segments.length; count++) {
            result.add(`/${segments.slice(0, count).join("/")}/`);
        }
    }
    return [...result];
}
