/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import type { Root, RootContent } from "hast";

/** A section link refers to an actual heading ID in the sanitized article. */
export interface ArticleHeading {
    id: string;
    title: string;
    depth: number;
}

/**
 * Extracts decoded text from headings that may contain emphasis, code, or links.
 *
 * @param node - An inert HTML syntax-tree node.
 * @returns Plain text with HTML entities already decoded by the parser.
 */
function textContent(node: Root | RootContent): string {
    if (node.type === "text") {
        return node.value;
    }
    if ("children" in node) {
        return node.children.map(textContent).join("");
    }
    return "";
}

/**
 * Inspects already-sanitized article HTML identically during SSG and hydration.
 *
 * @param html - HTML returned by the documentation builder's page renderer.
 * @returns Document-order section headings with existing, unique anchor IDs.
 * @throws {Error} If parsing the supplied HTML fails.
 */
export function articleHeadings(html: string): ArticleHeading[] {
    const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
    const headings: ArticleHeading[] = [];
    const seen = new Set<string>();
    /**
     * Visits inert elements without interpreting document-supplied code.
     *
     * @param node - Current parsed node.
     */
    function collect(node: Root | RootContent): void {
        if (node.type === "element" && /^h[2-6]$/u.test(node.tagName)) {
            const id = node.properties.id;
            if (typeof id === "string" && id.length > 0 && !seen.has(id)) {
                headings.push({ id, title: textContent(node), depth: Number(node.tagName.slice(1)) });
                seen.add(id);
            }
        }
        if ("children" in node) {
            node.children.forEach(collect);
        }
    }
    collect(tree);
    return headings;
}
