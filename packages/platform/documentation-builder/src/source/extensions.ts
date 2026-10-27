/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { visit } from "unist-util-visit";
import type { Root, PhrasingContent } from "mdast";
import { slug } from "github-slugger";

declare module "mdast" {
    /** Identifies a parsed wikilink before shared destination rewriting. */
    interface LinkData {
        wikilink?: boolean;
    }
}

/**
 * Converts wikilinks into ordinary Markdown links before shared destination resolution.
 *
 * @param tree - Markdown tree to transform.
 */
export function transformWikilinks(tree: Root): void {
    visit(tree, "text", function wikilink(node, index, parent): number | undefined {
        if (parent === undefined || index === undefined || parent.type === "link" || parent.type === "linkReference") {
            return undefined;
        }
        const replacement = wikilinkNodes(node.value);
        if (replacement.length === 1 && replacement[0]?.type === "text") {
            return undefined;
        }
        parent.children.splice(index, 1, ...replacement);
        return index + replacement.length;
    });
}

/**
 * Splits text into ordinary text and explicit wikilink nodes.
 *
 * @param value - Original Markdown text.
 * @returns A replacement inline sequence.
 */
function wikilinkNodes(value: string): PhrasingContent[] {
    const result: PhrasingContent[] = [];
    let offset = 0;
    for (const match of value.matchAll(/\[\[(?<target>[^\]|]+)(?:\|(?<label>[^\]]+))?\]\]/gu)) {
        const target = match.groups?.["target"] ?? "";
        const hash = target.indexOf("#");
        const url = hash < 0 ? target : `${target.slice(0, hash)}#${slug(target.slice(hash + 1))}`;
        result.push({ type: "text", value: value.slice(offset, match.index) });
        result.push({
            type: "link",
            url,
            data: { wikilink: true },
            children: [{ type: "text", value: match.groups?.["label"] ?? target }],
        });
        offset = match.index + match[0].length;
    }
    result.push({ type: "text", value: value.slice(offset) });
    return result;
}

/**
 * Converts Obsidian callouts into semantic, distinctly classed blocks.
 *
 * @param tree - Markdown tree to transform.
 */
export function transformCallouts(tree: Root): void {
    visit(tree, "blockquote", function callout(node): void {
        const first = node.children[0];
        if (first?.type !== "paragraph") {
            return;
        }
        const text = first.children[0];
        if (text?.type !== "text") {
            return;
        }
        const marker = /^\[!(?<type>[a-z][\w-]*)\][+-]?(?:[ \t]+(?<title>[^\n]*))?(?:\n|$)/iu.exec(text.value);
        if (marker === null) {
            return;
        }
        const { type, title } = calloutDetails(marker);
        text.value = text.value.slice(marker[0].length);
        // eslint-disable-next-line no-param-reassign -- callout properties are supplied through remark's mutable AST API.
        node.data = { ...node.data, hName: "aside", hProperties: { className: ["callout", `callout-${type}`] } };
        node.children.unshift({
            type: "paragraph",
            children: [{ type: "strong", children: [{ type: "text", value: title }] }],
        });
    });
}

/**
 * Resolves a callout's optional title independently of AST mutation.
 *
 * @param marker - Parsed callout marker.
 * @returns Normalized callout type and title.
 */
function calloutDetails(marker: RegExpExecArray): { type: string; title: string } {
    const type = (marker.groups?.["type"] ?? "note").toLowerCase();
    return { type, title: marker.groups?.["title"] ?? type };
}
