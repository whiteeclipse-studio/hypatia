/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { posix } from "node:path";
import { selectTranslation } from "../../content/localization";
import { contentRoute, type DocumentationCatalogue, type SourceDocument } from "./catalogue";
import { isWithinDocs } from "./files";

/** Parsed local destination, resolved from the actual source file's location. */
interface LocalDestination {
    target: string;
    query: string;
    fragment: string;
}

/**
 * Namespaces fragments consistently with the sanitizer's clobber protection.
 *
 * @param fragment - Encoded or literal source fragment, without its hash.
 * @returns A safe, namespaced fragment.
 * @throws {URIError} If the fragment contains malformed percent encoding.
 */
function headingFragment(fragment: string): string {
    return fragment === "" ? "" : `#${encodeURIComponent(`user-content-${decodeURIComponent(fragment)}`)}`;
}

/**
 * Resolves a destination lexically, without reading its target.
 *
 * @param value - Relative or root-relative source destination.
 * @param document - Actual source file, including its translation directory.
 * @returns A docs-relative target with its query and source fragment.
 * @throws {URIError} If the path contains malformed percent encoding.
 */
function localDestination(value: string, document: SourceDocument): LocalDestination {
    const pairLength = 2;
    const [beforeHash = "", fragment = ""] = value.split("#", pairLength);
    const [pathname = "", query] = beforeHash.split("?", pairLength);
    const decoded = decodeURIComponent(pathname);
    const target = decoded.startsWith("/")
        ? posix.relative("/docs", posix.normalize(decoded))
        : posix.normalize(posix.join(posix.dirname(document.sourcePath), decoded));
    return { target, query: query === undefined ? "" : `?${query}`, fragment };
}

/**
 * Rewrites published local targets and leaves outside or unpublished links unchanged.
 *
 * @param value - Validated local source URL.
 * @param document - Current source and authored locale.
 * @param catalogue - Known documentation and supporting assets.
 * @returns The published URL or unchanged unresolved source URL.
 * @throws {URIError} If the path or fragment contains malformed percent encoding.
 */
function publishedDestination(value: string, document: SourceDocument, catalogue: DocumentationCatalogue): string {
    const { target, query, fragment } = localDestination(value, document);
    if (!isWithinDocs(target)) {
        return value;
    }
    const page =
        catalogue.documents.find(entry => entry.sourcePath === target) ??
        (posix.extname(target) === ""
            ? catalogue.documents.find(entry => entry.sourcePath === posix.join(target, "README.md"))
            : undefined);
    if (page !== undefined) {
        const variants = catalogue.documents.filter(entry => entry.canonicalPath === page.canonicalPath);
        const translated = page.language === "en" ? (selectTranslation(variants, document.language) ?? page) : page;
        return `${translated.route}${query}${headingFragment(fragment)}`;
    }
    if (catalogue.assets.includes(target)) {
        return `${contentRoute(target, catalogue.repository, catalogue.base)}${query}${fragment === "" ? "" : `#${fragment}`}`;
    }
    return value;
}

/**
 * Validates URL protocols independently of path boundaries and rewrites only inventoried documentation.
 * No URL or link target causes an additional file read or network request.
 *
 * @param value - Source link or image destination.
 * @param document - Current source, including its true translated file location.
 * @param catalogue - Configured source inventory.
 * @returns The published or unresolved URL, or undefined for an unsafe destination.
 */
export function rewriteDestination(
    value: string,
    document: SourceDocument,
    catalogue: DocumentationCatalogue,
): string | undefined {
    try {
        const resolved = new URL(value, "https://documentation.invalid/");
        if (!value.startsWith("#") && /^[a-z][a-z\d+.-]*:/i.test(value)) {
            return ["https:", "mailto:"].includes(resolved.protocol) ? value : undefined;
        }
        if (resolved.origin !== "https://documentation.invalid" || value.includes("\\")) {
            return undefined;
        }
        return value.startsWith("#")
            ? headingFragment(value.slice(1))
            : publishedDestination(value, document, catalogue);
    } catch {
        return undefined;
    }
}
