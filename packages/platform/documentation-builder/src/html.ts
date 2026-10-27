/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import { requireCondition } from "./errors.ts";
import { resolveReference } from "./paths.ts";
import { hasControls } from "./text.ts";

/** Only generated headings carry IDs; raw source HTML is never admitted. */
export const htmlSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), "aside"],
    clobberPrefix: "",
    attributes: {
        ...defaultSchema.attributes,
        "*": ["className"],
        h1: ["id"],
        h2: ["id"],
        h3: ["id"],
        h4: ["id"],
        h5: ["id"],
        h6: ["id"],
        a: ["href", "title", "download"],
    },
    protocols: { href: ["https", "http", "mailto"], src: ["https", "http"] },
};

/** A parsed reference distinguishes website-independent paths from external URLs. */
export interface ParsedReference {
    external: boolean;
    path: string;
    suffix: string;
}

/**
 * Checks URL syntax before sanitation can silently discard an unsafe destination.
 *
 * @param url - Original link or asset destination.
 * @param from - Containing archive or source page.
 * @returns Parsed and resolved destination.
 * @throws {DocumentationError} For unsafe schemes, absolute paths, or root traversal.
 */
export function parseReference(url: string, from: string): ParsedReference {
    requireCondition(!hasControls(url, true) && !url.includes("\\"), `Unsafe URL: ${url}`, "unsafe-link");
    if (/^[a-z][a-z\d+.-]*:/iu.test(url)) {
        requireCondition(/^(?:https?:\/\/|mailto:)/iu.test(url), `Unsafe URL scheme: ${url}`, "unsafe-link");
        return { external: true, path: url, suffix: "" };
    }
    if (url.startsWith("#") || url.startsWith("?") || url === "") {
        return { external: false, path: from, suffix: url };
    }
    const boundary = url.search(/[?#]/u);
    const path = boundary < 0 ? url : url.slice(0, boundary);
    const suffix = boundary < 0 ? "" : url.slice(boundary);
    return { external: false, path: resolveReference(from, path), suffix };
}

/**
 * Parses, validates destinations, sanitizes, optionally rewrites, and serializes imported HTML.
 *
 * @param html - Untrusted generated or imported fragment.
 * @param from - Page path used for reference confinement.
 * @param rewrite - Optional safe URL resolver after allowlist sanitation.
 * @returns A sanitized HTML fragment.
 * @throws {DocumentationError} When imported destinations escape the artifact or use unsafe schemes.
 */
export function sanitizeHtml(html: string, from: string, rewrite?: (url: string, element: Element) => string): string {
    const processor = unified().use(rehypeParse, { fragment: true });
    const tree = processor.parse(html);
    visit(tree, "element", checkElementReferences(from));
    const clean = unified().use(rehypeSanitize, htmlSchema).runSync(tree);
    if (rewrite !== undefined) {
        visit(clean, "element", rewriteElementReferences(rewrite));
    }
    return unified().use(rehypeStringify).stringify(clean);
}

/**
 * Produces a tree visitor that checks URL-bearing attributes before sanitizing.
 *
 * @param from - Containing archive path.
 * @returns A visitor confined to safe destinations.
 */
function checkElementReferences(from: string): (node: Element) => void {
    /**
     * Validates each supported URL-bearing attribute.
     *
     * @param node - Imported element.
     */
    return function check(node: Element): void {
        for (const property of ["href", "src", "poster", "action", "xLinkHref"]) {
            const url = node.properties[property];
            if (typeof url === "string") {
                parseReference(url, from);
            }
        }
    };
}

/**
 * Creates a visitor for safe, application-supplied destination resolution.
 *
 * @param rewrite - Destination resolver.
 * @returns An element visitor.
 */
function rewriteElementReferences(rewrite: (url: string, node: Element) => string): (node: Element) => void {
    /**
     * Rewrites href and src on already-sanitized elements.
     *
     * @param node - Sanitized element.
     */
    return function rewriteElement(node: Element): void {
        for (const property of ["href", "src"]) {
            const url = node.properties[property];
            if (typeof url === "string") {
                // eslint-disable-next-line no-param-reassign -- rehype visitors intentionally update the sanitized AST.
                node.properties[property] = rewrite(url, node);
            }
        }
    };
}

/**
 * Returns a fresh HTML syntax tree for consumers needing structural inspection.
 *
 * @param html - HTML fragment.
 * @returns Its parsed tree.
 */
export function parseHtml(html: string): Root {
    return unified().use(rehypeParse, { fragment: true }).parse(html);
}
