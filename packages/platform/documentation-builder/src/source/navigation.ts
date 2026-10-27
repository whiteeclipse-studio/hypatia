/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Root } from "mdast";
import type { GeneratedPageMetadata, NavigationEntry } from "../types.ts";
import { parentPath, comparePaths } from "../paths.ts";
import { requireCondition } from "../errors.ts";
import { enclosingReadme, generatedDocument, type PreparedDocument } from "./documents.ts";
import { relativeUrl } from "./links.ts";

/**
 * Adds missing documentation-folder indexes using overrides or the nearest authored README.
 *
 * @param documents - Parsed authored pages.
 * @param metadata - Optional per-field overrides keyed by generated HTML path.
 * @returns All authored and generated pages.
 * @throws {DocumentationError} When neither configuration nor an enclosing README supplies disclosures.
 */
export function addFolderIndexes(
    documents: PreparedDocument[],
    metadata: Record<string, GeneratedPageMetadata>,
): PreparedDocument[] {
    const folders = new Set<string>([""]);
    for (const document of documents) {
        let folder = parentPath(document.sourcePath);
        while (folder.length > 0) {
            folders.add(folder);
            folder = parentPath(folder);
        }
    }
    const result = [...documents];
    for (const folder of [...folders].sort(comparePaths)) {
        const source = `${folder.length > 0 ? `${folder}/` : ""}README.md`;
        if (
            !documents.some(function index(document): boolean {
                return document.sourcePath === source;
            })
        ) {
            const path = `${folder.length > 0 ? `${folder}/` : ""}index.html`;
            result.push(
                generatedDocument(
                    path,
                    metadata[path],
                    { type: "root", children: [] },
                    enclosingReadme(path, documents),
                ),
            );
        }
    }
    return result;
}

/**
 * Creates folder navigation and fills generated indexes with contents links.
 *
 * @param documents - Complete document collection.
 * @returns A tree rooted in the repository's index page.
 * @throws {DocumentationError} When a folder index is missing.
 */
export function createNavigation(documents: PreparedDocument[]): NavigationEntry[] {
    const root = documents.find(function rootIndex(document): boolean {
        return document.sourcePath === "README.md";
    });
    requireCondition(root !== undefined, "Missing root documentation index");
    return [navigationEntry(root, documents)];
}

/**
 * Creates one page or folder entry with deterministic folder-first children.
 *
 * @param document - Page represented by this entry.
 * @param documents - Complete source mapping.
 * @returns The page's navigation subtree.
 */
function navigationEntry(document: PreparedDocument, documents: PreparedDocument[]): NavigationEntry {
    const children = isFolderIndex(document) ? childDocuments(document, documents) : [];
    const entries = children.map(function child(page): NavigationEntry {
        return navigationEntry(page, documents);
    });
    if (document.generated && document.path.endsWith("index.html")) {
        // eslint-disable-next-line no-param-reassign -- fill the generated document's body after its children are known.
        document.article = contentsTree(document, children);
    }
    return { title: document.title, pageId: document.id, children: entries };
}

/**
 * Selects direct child folders and pages, suppressing duplicate README children and AGENTS pages.
 *
 * @param index - Current folder's README-derived page.
 * @param documents - Complete page mapping.
 * @returns Direct children in stable folder-first order.
 */
function childDocuments(index: PreparedDocument, documents: PreparedDocument[]): PreparedDocument[] {
    const folder = parentPath(index.sourcePath);
    const children = documents.filter(function direct(document): boolean {
        if (document.id === index.id || !document.navigable) {
            return false;
        }
        const parent = parentPath(document.sourcePath);
        const isFolder = isFolderIndex(document);
        return isFolder ? parent !== folder && parentPath(parent) === folder : parent === folder;
    });
    return children.sort(function foldersFirst(left, right): number {
        const folderDifference = Number(isFolderIndex(right)) - Number(isFolderIndex(left));
        return folderDifference === 0 ? comparePaths(left.sourcePath, right.sourcePath) : folderDifference;
    });
}

/**
 * Distinguishes exact README names from similarly suffixed article filenames.
 *
 * @param document - Prepared page.
 * @returns Whether the page represents its containing folder.
 */
function isFolderIndex(document: PreparedDocument): boolean {
    return document.sourcePath.split("/").pop() === "README.md";
}

/**
 * Generates an index body without repeating its document-level notices or revision table.
 *
 * @param document - Generated folder page.
 * @param children - Navigable pages and subfolder indexes.
 * @returns An inert Markdown table of contents.
 */
function contentsTree(document: PreparedDocument, children: PreparedDocument[]): Root {
    return {
        type: "root",
        children: [
            { type: "heading", depth: 1, children: [{ type: "text", value: document.title }] },
            {
                type: "list",
                ordered: false,
                spread: false,
                children: children.map(function item(child) {
                    return {
                        type: "listItem",
                        spread: false,
                        children: [
                            {
                                type: "paragraph",
                                children: [
                                    {
                                        type: "link",
                                        url: relativeUrl(document.path, child.path),
                                        children: [{ type: "text", value: child.title }],
                                    },
                                ],
                            },
                        ],
                    };
                }),
            },
        ],
    };
}
