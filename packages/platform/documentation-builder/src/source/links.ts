/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { BuildDiagnostic } from "../types.ts";
import { parseReference } from "../html.ts";
import { parentPath, encodePath } from "../paths.ts";
import type { PreparedDocument } from "./documents.ts";

/** Link resolution inputs shared across article and disclosure rendering. */
export interface LinkContext {
    document: PreparedDocument;
    documents: PreparedDocument[];
    assets: Set<string>;
    diagnostics: BuildDiagnostic[];
    /** Original Markdown location when a disclosure is inherited from another page. */
    sourcePath?: string;
}

/**
 * Rewrites links, image destinations, and reference definitions against generated paths.
 *
 * @param tree - Markdown tree to transform.
 * @param context - Artifact-wide source mapping and diagnostic collector.
 * @throws {DocumentationError} For unsafe authored references.
 */
export function rewriteLinks(tree: Root, context: LinkContext): void {
    visit(tree, function link(node): void {
        if (node.type === "link" || node.type === "image" || node.type === "definition") {
            // eslint-disable-next-line no-param-reassign -- remark visitors intentionally rewrite source AST destinations.
            node.url = rewriteDestination(node.url, node.type === "link" && node.data?.wikilink === true, context);
        }
    });
}

/**
 * Resolves a source destination and warns without guessing when a safe target is missing.
 *
 * @param original - Authored URL.
 * @param wiki - Whether basename and stable-ID lookup are permitted.
 * @param context - Current page and available outputs.
 * @returns A relative published URL or the unchanged unresolved URL.
 * @throws {DocumentationError} For root escapes or unsafe schemes.
 */
function rewriteDestination(original: string, wiki: boolean, context: LinkContext): string {
    const sourcePath = context.sourcePath ?? context.document.sourcePath;
    const reference = parseReference(original, sourcePath);
    if (
        reference.external ||
        ((original.startsWith("#") || original.startsWith("?")) && sourcePath === context.document.sourcePath)
    ) {
        return original;
    }
    const document = findDocument(reference.path, wiki, context);
    const target = document?.path ?? (context.assets.has(reference.path) ? reference.path : undefined);
    if (target !== undefined) {
        return `${relativeUrl(context.document.path, target)}${reference.suffix}`;
    }
    context.diagnostics.push({
        code: "unresolved-link",
        path: sourcePath,
        message: `Unresolved link preserved: ${original}`,
    });
    return original;
}

/**
 * Finds exact Markdown paths first, then unambiguous wikilink IDs or basenames.
 *
 * @param path - Resolved source path.
 * @param wiki - Enables Obsidian-style shorthand matching.
 * @param context - Artifact-wide page mapping.
 * @returns A unique target when available.
 */
function findDocument(path: string, wiki: boolean, context: LinkContext): PreparedDocument | undefined {
    const exact = context.documents.find(function matching(document): boolean {
        return (
            document.sourcePath === path ||
            document.path === path ||
            document.sourcePath === `${path.length > 0 ? `${path}/` : ""}README.md` ||
            (wiki && document.sourcePath === `${path}.md`)
        );
    });
    if (exact !== undefined || !wiki) {
        return exact;
    }
    const basename = path.split("/").pop() ?? "";
    const candidates = context.documents.filter(function matching(document): boolean {
        return document.id === basename || document.sourcePath.split("/").pop()?.replace(/\.md$/u, "") === basename;
    });
    return candidates.length === 1 ? candidates[0] : undefined;
}

/**
 * Computes a relative published URL while retaining the original folder hierarchy.
 *
 * @param from - Containing generated page path.
 * @param target - Resolved generated destination.
 * @returns A relative URL using encoded literal filenames.
 */
export function relativeUrl(from: string, target: string): string {
    const parent = parentPath(from).split("/").filter(Boolean);
    const destination = target.split("/");
    while (parent.length > 0 && parent[0] === destination[0]) {
        parent.shift();
        destination.shift();
    }
    return `${"../".repeat(parent.length)}${encodePath(destination.join("/"))}`;
}
