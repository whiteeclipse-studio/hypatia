/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { toString } from "mdast-util-to-string";
import type { Root, RootContent } from "mdast";
import type { GeneratedPageMetadata, SourceFile } from "../types.ts";
import { requireCondition } from "../errors.ts";
import { htmlPath, parentPath } from "../paths.ts";
import { decodeText } from "../assets/index.ts";
import { objectValue, positiveInteger, stringValue } from "../artifact/guards.ts";
import { YAML } from "bun";

const sectionDepth = 2;
const noSection = -1;

/** A parsed document before HTML rendering and disclosure extraction. */
export interface PreparedDocument {
    id: string;
    title: string;
    sourcePath: string;
    path: string;
    article: Root;
    notice: Root;
    history: Root;
    noticeSourcePath?: string;
    historySourcePath?: string;
    generated: boolean;
    navigable: boolean;
}

/**
 * Parses inert Markdown, including GFM tables and YAML front matter.
 *
 * @param text - Markdown source.
 * @returns Its Markdown syntax tree.
 */
export function parseMarkdown(text: string): Root {
    return unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter, ["yaml"]).parse(text);
}

/**
 * Parses a required front-matter object with Bun's builtin YAML parser.
 *
 * @param file - Source file.
 * @returns The parsed metadata fields.
 * @throws {Error} For missing or malformed YAML metadata.
 */
export function sourceMetadata(file: SourceFile): Record<string, unknown> {
    const first = parseMarkdown(decodeText(file.content)).children[0];
    requireCondition(first?.type === "yaml", `Missing YAML front matter: ${file.path}`, "metadata");
    const parsed: unknown = YAML.parse(first.value);
    return objectValue(parsed);
}

/**
 * Extracts an authored page's content and complete document-level disclosures.
 *
 * @param file - Markdown source with required front matter.
 * @returns A document ready for link resolution and rendering.
 * @throws {DocumentationError} For missing IDs, titles, notices, or history sections.
 */
export function prepareDocument(file: SourceFile): PreparedDocument {
    const tree = parseMarkdown(decodeText(file.content));
    const metadata = sourceMetadata(file);
    const heading = tree.children.find(isTitle);
    const notice = sectionIndex(tree, "Copyright and licence");
    const history = sectionIndex(tree, "Revisions");
    requireCondition(
        heading !== undefined && notice >= 0 && history > notice,
        `Missing document sections: ${file.path}`,
        "metadata",
    );
    requireCondition(
        nextSection(tree, history) === tree.children.length,
        `Revisions must be the final section: ${file.path}`,
        "metadata",
    );
    const excluded = new Set([...sectionRange(tree, notice), ...sectionRange(tree, history)]);
    const article = tree.children.filter(function content(node, index): boolean {
        return node.type !== "yaml" && !excluded.has(index);
    });
    return {
        id: stringValue(metadata["id"]),
        title: toString(heading),
        sourcePath: file.path,
        path: htmlPath(file.path),
        article: { type: "root", children: article },
        notice: sectionTree(tree, notice),
        history: sectionTree(tree, history),
        generated: false,
        navigable: file.path.split("/").pop() !== "AGENTS.md",
    };
}

/**
 * Builds a page with configured overrides and disclosures inherited from an authored README.
 *
 * @param path - Generated HTML output path.
 * @param metadata - Optional per-field overrides.
 * @param article - Generated or licence article syntax tree.
 * @param fallback - Nearest authored README supplying missing disclosures.
 * @returns A generated page with its own ID and disclosures.
 * @throws {DocumentationError} When disclosures have neither an override nor an enclosing README.
 */
export function generatedDocument(
    path: string,
    metadata: GeneratedPageMetadata | undefined,
    article: Root,
    fallback?: PreparedDocument,
): PreparedDocument {
    const sourcePath = path.replace(/index\.html$/u, "README.md").replace(/\.html$/u, ".md");
    const notice = generatedDisclosure(path, "copyrightAndLicence", metadata, fallback);
    const history = generatedDisclosure(path, "revisions", metadata, fallback);
    return {
        id: stringValue(
            metadata?.id ??
                `generated-${path
                    .replace(/\.html$/u, "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/gu, "-")}`,
        ),
        title: stringValue(metadata?.title ?? generatedTitle(path)),
        path,
        sourcePath,
        article,
        notice: notice.tree,
        history: history.tree,
        noticeSourcePath: notice.sourcePath ?? sourcePath,
        historySourcePath: history.sourcePath ?? sourcePath,
        generated: true,
        navigable: true,
    };
}

/**
 * Finds the nearest authored README at or above a generated output's folder.
 *
 * @param path - Generated HTML path.
 * @param documents - Authored pages and any already prepared generated pages.
 * @returns The closest authored README, if one exists.
 */
export function enclosingReadme(path: string, documents: PreparedDocument[]): PreparedDocument | undefined {
    let folder = parentPath(path);
    for (;;) {
        const source = `${folder.length > 0 ? `${folder}/` : ""}README.md`;
        const readme = documents.find(function authored(document): boolean {
            return !document.generated && document.sourcePath === source;
        });
        if (readme !== undefined || folder.length === 0) {
            return readme;
        }
        folder = parentPath(folder);
    }
}

/**
 * Uses an explicit disclosure or copies its README tree before link rewriting mutates it.
 *
 * @param path - Generated page path for diagnostics.
 * @param field - Requested disclosure override.
 * @param metadata - Optional configured fields.
 * @param fallback - Authored README supplying the disclosure.
 * @returns An independent tree and its original source location when inherited.
 * @throws {DocumentationError} When no disclosure source is available.
 */
function generatedDisclosure(
    path: string,
    field: "copyrightAndLicence" | "revisions",
    metadata: GeneratedPageMetadata | undefined,
    fallback: PreparedDocument | undefined,
): { tree: Root; sourcePath?: string } {
    const configured = metadata?.[field];
    if (configured !== undefined) {
        return { tree: parseMarkdown(stringValue(configured)) };
    }
    requireCondition(
        fallback !== undefined,
        `Configure generatedPages[${JSON.stringify(path)}].${field} or add an enclosing README.md`,
        "metadata",
    );
    return {
        tree: structuredClone(field === "copyrightAndLicence" ? fallback.notice : fallback.history),
        sourcePath: fallback.sourcePath,
    };
}

/**
 * Names generated folder indexes after their folder and the root licence after its role.
 *
 * @param path - Generated HTML output path.
 * @returns A readable default title.
 */
function generatedTitle(path: string): string {
    if (path === "index.html") {
        return "Documentation";
    }
    if (path === "LICENCE.html") {
        return "Licence";
    }
    const name = parentPath(path).split("/").pop() ?? "Documentation";
    const words = name.replace(/[-_]+/gu, " ");
    return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Resolves a document's standards pin from its own metadata or nearest enclosing README.
 *
 * @param file - Authored source file.
 * @param sources - All Markdown sources keyed by path.
 * @throws {DocumentationError} For missing or invalid revision pins.
 */
export function requireStandardPin(file: SourceFile, sources: Map<string, SourceFile>): void {
    const metadata = sourceMetadata(file);
    if (metadata["standard_revision"] !== undefined) {
        positiveInteger(metadata["standard_revision"]);
        return;
    }
    const parts = file.path.split("/");
    parts.pop();
    do {
        const candidate = sources.get([...parts, "README.md"].join("/"));
        if (
            candidate !== undefined &&
            candidate.path !== file.path &&
            sourceMetadata(candidate)["standard_revision"] !== undefined
        ) {
            positiveInteger(sourceMetadata(candidate)["standard_revision"]);
            return;
        }
        parts.pop();
    } while (parts.length > 0);
    const root = sources.get("README.md");
    if (root !== undefined && root.path !== file.path && sourceMetadata(root)["standard_revision"] !== undefined) {
        positiveInteger(sourceMetadata(root)["standard_revision"]);
        return;
    }
    requireCondition(false, `Missing standard_revision or enclosing pinned README: ${file.path}`, "metadata");
}

/**
 * Identifies a document's title without inspecting fenced example headings.
 *
 * @param node - Top-level Markdown node.
 * @returns Whether the node is an H1 heading.
 */
function isTitle(node: RootContent): boolean {
    return node.type === "heading" && node.depth === 1;
}

/**
 * Locates one required top-level H2 section.
 *
 * @param tree - Parsed document.
 * @param title - Exact section title.
 * @returns Section index, or minus one.
 * @throws {DocumentationError} For repeated required sections.
 */
function sectionIndex(tree: Root, title: string): number {
    const matches = tree.children.flatMap(function matching(node, index): number[] {
        return node.type === "heading" && node.depth === sectionDepth && toString(node) === title ? [index] : [];
    });
    requireCondition(matches.length <= 1, `Repeated ${title} section`, "metadata");
    return matches[0] ?? noSection;
}

/**
 * Finds the next top-level section boundary.
 *
 * @param tree - Parsed document.
 * @param start - Starting H2 index.
 * @returns The next H1/H2 index or document end.
 */
function nextSection(tree: Root, start: number): number {
    const offset = tree.children.slice(start + 1).findIndex(function boundary(node): boolean {
        return node.type === "heading" && node.depth <= sectionDepth;
    });
    return offset < 0 ? tree.children.length : start + 1 + offset;
}

/**
 * Enumerates one section's node indexes, including its heading.
 *
 * @param tree - Parsed document.
 * @param start - Section start.
 * @returns Node indexes belonging to the section.
 */
function sectionRange(tree: Root, start: number): number[] {
    return Array.from({ length: nextSection(tree, start) - start }, function index(_value, offset): number {
        return start + offset;
    });
}

/**
 * Copies a complete disclosure section into its own Markdown root.
 *
 * @param tree - Parsed document.
 * @param start - Disclosure heading index.
 * @returns The section's complete syntax tree.
 */
function sectionTree(tree: Root, start: number): Root {
    return { type: "root", children: tree.children.slice(start, nextSection(tree, start)) };
}
