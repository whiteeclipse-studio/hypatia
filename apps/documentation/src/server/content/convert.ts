/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root } from "hast";
import type { DocumentArticle, DocumentHeading, DocumentSummary } from "../../content/types";
import type { DocumentationCatalogue, SourceDocument } from "./catalogue";
import { rewriteDestination } from "./links";
import { markdownParser } from "./markdown";

/**
 * Extracts the serializable document index without source Markdown or server paths.
 *
 * @param document - Discovered source document.
 * @returns Its public identity and translation relationship.
 */
export function summarizeDocument(document: SourceDocument): DocumentSummary {
    return {
        repository: document.repository,
        repositoryTitle: document.repositoryTitle,
        id: document.id,
        sourcePath: document.sourcePath,
        canonicalPath: document.canonicalPath,
        language: document.language,
        route: document.route,
        title: document.title,
        ...(document.sourceReference === undefined ? {} : { sourceReference: document.sourceReference }),
    };
}

/**
 * Converts one Markdown document to sanitized, non-executable HTML using the same pipeline in development and SSG.
 * Raw HTML is disabled; code remains text. Heading IDs and contents links use the final sanitizer-prefixed IDs.
 *
 * @param document - Validated source document.
 * @param catalogue - Inventory used to resolve only known documentation and asset destinations.
 * @returns The article HTML and its matching table of contents.
 * @rejects If Markdown parsing, transformation, or serialization fails.
 */
export async function convertDocument(
    document: SourceDocument,
    catalogue: DocumentationCatalogue,
): Promise<DocumentArticle> {
    const slugger = new GithubSlugger();
    const headings: DocumentHeading[] = [];

    /**
     * Assigns heading anchors and validates every generated link before sanitization.
     *
     * @returns The HTML-tree transformer.
     */
    function prepareHtml() {
        /**
         * Applies application-owned anchors and URL policies.
         *
         * @param tree - Generated HTML tree.
         */
        return (tree: Root): void => {
            visit(tree, "element", node => {
                if (typeof node.properties.id === "string") {
                    slugger.slug(node.properties.id);
                }
            });
            visit(tree, "element", node => {
                const properties = { ...node.properties };
                if (/^h[1-6]$/.test(node.tagName) && typeof properties.id !== "string") {
                    properties.id = slugger.slug(toString(node));
                }
                for (const property of ["href", "src"]) {
                    const value = properties[property];
                    if (typeof value === "string") {
                        const destination = rewriteDestination(value, document, catalogue);
                        if (destination === undefined) {
                            delete properties[property];
                        } else {
                            properties[property] = destination;
                        }
                    }
                }
                Object.assign(node, { properties });
            });
            visit(tree, "element", (node, index, parent) => {
                if (node.tagName === "table" && index !== undefined && parent !== undefined) {
                    parent.children.splice(index, 1, {
                        type: "element",
                        tagName: "div",
                        properties: {
                            className: ["table-scroll"],
                            tabIndex: 0,
                            role: "region",
                            ariaLabel: document.title,
                        },
                        children: [node],
                    });
                }
            });
        };
    }

    /**
     * Collects headings only after sanitation has applied its clobber protection.
     *
     * @returns The final HTML-tree transformer.
     */
    function collectHeadings() {
        /**
         * Captures the actual IDs used by the published article.
         *
         * @param tree - Sanitized HTML tree.
         */
        return (tree: Root): void => {
            visit(tree, "element", node => {
                if (/^h[1-6]$/.test(node.tagName) && typeof node.properties.id === "string") {
                    headings.push({
                        id: node.properties.id,
                        title: toString(node),
                        depth: Number(node.tagName.slice(1)),
                    });
                }
            });
        };
    }

    const result = await markdownParser()
        .use(remarkRehype, { allowDangerousHtml: false, clobberPrefix: "" })
        .use(prepareHtml)
        .use(rehypeSanitize, {
            ...defaultSchema,
            attributes: {
                ...defaultSchema.attributes,
                div: [
                    ...(defaultSchema.attributes?.["div"] ?? []),
                    ["className", "table-scroll"],
                    "tabIndex",
                    "role",
                    "ariaLabel",
                ],
            },
            protocols: { ...defaultSchema.protocols, href: ["https", "mailto"], src: ["https"] },
        })
        .use(collectHeadings)
        .use(rehypeStringify)
        .process(document.markdown);
    return { ...summarizeDocument(document), html: String(result), headings };
}
