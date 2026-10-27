/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { unified } from "unified";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import type { Root } from "mdast";
import { sanitizeHtml } from "../html.ts";
import { transformCallouts, transformWikilinks } from "./extensions.ts";
import { rewriteLinks, type LinkContext } from "./links.ts";

/**
 * Renders inert Markdown through the same remark/rehype and final sanitization pipeline.
 *
 * @param tree - Article or disclosure Markdown tree.
 * @param context - Artifact-wide link context.
 * @returns Sanitized HTML, without source front matter or executable content.
 * @throws {Error} For unsafe references or malformed processing input.
 */
export function renderMarkdown(tree: Root, context: LinkContext): string {
    transformWikilinks(tree);
    transformCallouts(tree);
    rewriteLinks(tree, context);
    addHeadingAnchors(tree);
    const processor = unified().use(remarkRehype, { allowDangerousHtml: false }).use(rehypeStringify);
    const html = processor.stringify(processor.runSync(tree));
    return sanitizeHtml(html, context.document.path);
}

/**
 * Produces deterministic GitHub-compatible heading fragments with duplicate disambiguation.
 *
 * @param tree - Markdown article or disclosure.
 */
function addHeadingAnchors(tree: Root): void {
    const slugger = new GithubSlugger();
    visit(tree, "heading", function heading(node): void {
        // eslint-disable-next-line no-param-reassign -- heading properties are the remark-to-rehype transformation API.
        node.data = { ...node.data, hProperties: { id: slugger.slug(toString(node)) } };
    });
}
