/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type {
    DocumentationArtifact,
    DocumentationManifest,
    DocumentationPage,
    NavigationEntry,
    ProcessingLimits,
} from "../types.ts";
import { decodeText, validateAsset } from "../assets/index.ts";
import { checkFileLimits } from "../limits.ts";
import { archivePath, parentPath } from "../paths.ts";
import { requireCondition } from "../errors.ts";
import { sanitizeHtml, parseHtml } from "../html.ts";
import { documentRevision, nodeText } from "../history.ts";
import { parseManifest } from "./manifest.ts";

/**
 * Checks inventory, navigation, disclosures, HTML, and assets before exposing an artifact.
 *
 * @param input - Untrusted expanded file collection.
 * @param limits - Resolved resource ceilings.
 * @returns A fresh, sanitized artifact and authoritative manifest.
 * @rejects For malformed manifests, conflicting or missing paths, or unsafe contents.
 */
export async function validateArtifactData(
    input: Map<string, Uint8Array>,
    limits: ProcessingLimits,
): Promise<DocumentationArtifact> {
    checkFileLimits(input.values(), limits);
    const bytes = input.get("manifest.json");
    requireCondition(bytes !== undefined, "Artifact is missing manifest.json");
    const parsed: unknown = JSON.parse(decodeText(bytes));
    const manifest = parseManifest(parsed);
    validateInventory(manifest, input);
    validatePages(manifest);
    validateNavigation(manifest);
    const files = await sanitizeFiles(manifest, input);
    files.set("manifest.json", new TextEncoder().encode(JSON.stringify(manifest)));
    checkFileLimits(files.values(), limits);
    return { manifest, files };
}

/**
 * Requires an exact file inventory and rejects files that collide with directory prefixes.
 *
 * @param manifest - Parsed manifest.
 * @param files - Expanded file map.
 * @throws {DocumentationError} For missing, duplicate, unlisted, or conflicting files.
 */
function validateInventory(manifest: DocumentationManifest, files: Map<string, Uint8Array>): void {
    const listed = new Set<string>();
    for (const file of manifest.files) {
        requireCondition(
            !listed.has(file.path) && files.has(file.path),
            `Missing or duplicate inventory file: ${file.path}`,
        );
        requireCondition(
            file.kind !== "metadata" || (file.path === "manifest.json" && file.mediaType === "application/json"),
            "Invalid metadata inventory",
        );
        requireCondition(file.path !== "manifest.json" || file.kind === "metadata", "manifest.json must be metadata");
        listed.add(file.path);
    }
    requireCondition(
        listed.size === files.size && listed.has("manifest.json"),
        "File inventory does not match archive",
    );
    for (const path of files.keys()) {
        archivePath(path);
        requireCondition(listed.has(path), `Unlisted file: ${path}`);
        let parent = parentPath(path);
        while (parent.length > 0) {
            requireCondition(!files.has(parent), `Conflicting file and directory: ${parent}`);
            parent = parentPath(parent);
        }
    }
}

/**
 * Checks page identity, disclosures, and the bijection between pages and HTML inventory entries.
 *
 * @param manifest - Parsed manifest.
 * @throws {DocumentationError} For duplicate IDs, missing pages, or incomplete histories and notices.
 */
function validatePages(manifest: DocumentationManifest): void {
    requireCondition(
        manifest.pages.some(function root(page): boolean {
            return page.path === "index.html";
        }),
        "Missing root index page",
    );
    const ids = new Set<string>();
    const paths = new Set<string>();
    for (const page of manifest.pages) {
        requireCondition(!ids.has(page.id) && !paths.has(page.path), `Duplicate page: ${page.id}`);
        requireCondition(
            page.sourcePath.split("/").pop() !== "AGENTS.md" || !page.navigable,
            "AGENTS.md cannot appear in navigation",
        );
        requireCondition(documentRevision(page.revisions) === page.revision, `Wrong document revision: ${page.id}`);
        requireCondition(
            parseHtml(page.copyrightAndLicence).children.map(nodeText).join("").trim().length > 0,
            `Empty notice: ${page.id}`,
        );
        ids.add(page.id);
        paths.add(page.path);
    }
    const html = manifest.files.filter(function pageFile(file): boolean {
        return file.kind === "page" && file.mediaType === "text/html";
    });
    requireCondition(
        html.length === paths.size &&
            html.every(function present(file): boolean {
                return paths.has(file.path);
            }),
        "Page inventory does not match page entries",
    );
}

/**
 * Checks navigation coverage, uniqueness, folder indexes, and child hierarchy.
 *
 * @param manifest - Parsed manifest.
 * @throws {DocumentationError} For invalid navigation references or hidden pages in the tree.
 */
function validateNavigation(manifest: DocumentationManifest): void {
    const pages = new Map(
        manifest.pages.map(function keyed(page): [string, DocumentationPage] {
            return [page.id, page];
        }),
    );
    const visited = new Set<string>();
    const pending = manifest.navigation.map(function root(entry): { entry: NavigationEntry; folder: string } {
        return { entry, folder: "" };
    });
    while (pending.length > 0) {
        const current = pending.pop();
        requireCondition(current !== undefined, "Invalid navigation state");
        const page = pages.get(current.entry.pageId);
        requireCondition(
            page !== undefined && page.navigable && !visited.has(page.id),
            "Invalid or repeated navigation reference",
        );
        const parent = parentPath(page.path);
        const folderIndex = page.path.split("/").pop() === "index.html";
        requireCondition(
            parent === current.folder || (folderIndex && parentPath(parent) === current.folder),
            "Navigation hierarchy mismatch",
        );
        visited.add(page.id);
        enqueueChildren(current.entry, page, pending);
    }
    requireCondition(
        manifest.pages.every(function covered(page): boolean {
            return page.navigable === visited.has(page.id);
        }),
        "Navigation must cover every navigable page exactly once",
    );
}

/**
 * Registers children only beneath a folder's index page.
 *
 * @param entry - Navigation parent.
 * @param page - Its index or leaf page.
 * @param pending - Remaining entries.
 * @throws {DocumentationError} For children attached to a non-index page.
 */
function enqueueChildren(
    entry: NavigationEntry,
    page: DocumentationPage,
    pending: { entry: NavigationEntry; folder: string }[],
): void {
    requireCondition(
        entry.children.length === 0 || page.path.split("/").pop() === "index.html",
        "Navigation children need a folder index",
    );
    for (const child of entry.children) {
        const childFolder = parentPath(page.path);
        pending.push({ entry: child, folder: childFolder });
    }
}

/**
 * Sanitizes content and verifies declared media types against actual asset bytes.
 *
 * @param manifest - Parsed and cross-checked manifest.
 * @param input - Original expanded bytes.
 * @returns A new file map containing only validated content.
 * @rejects For unsafe assets, URLs, or mismatched media types.
 */
async function sanitizeFiles(
    manifest: DocumentationManifest,
    input: Map<string, Uint8Array>,
): Promise<Map<string, Uint8Array>> {
    const files = new Map<string, Uint8Array>();
    for (const item of manifest.files) {
        const bytes = input.get(item.path);
        requireCondition(bytes !== undefined, `Missing file: ${item.path}`);
        if (item.kind === "asset") {
            const asset = await validateAsset(item.path, bytes);
            requireCondition(asset.mediaType === item.mediaType, `Asset MIME mismatch: ${item.path}`);
            files.set(item.path, asset.content);
        } else if (item.kind === "page") {
            files.set(item.path, new TextEncoder().encode(sanitizeHtml(decodeText(bytes), item.path)));
        }
    }
    return files;
}
