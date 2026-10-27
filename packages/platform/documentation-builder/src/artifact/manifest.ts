/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type {
    ArtifactFile,
    DocumentationManifest,
    DocumentationPage,
    NavigationEntry,
    RepositorySource,
} from "../types.ts";
import { requireCondition } from "../errors.ts";
import { archivePath, htmlPath } from "../paths.ts";
import { sanitizeHtml } from "../html.ts";
import { arrayValue, booleanValue, objectValue, positiveInteger, stringValue } from "./guards.ts";

/**
 * Validates and reconstructs the supported manifest without trusting parsed JSON types.
 *
 * @param value - Untrusted manifest JSON.
 * @returns Version-1 manifest with sanitized embedded disclosures.
 * @throws {DocumentationError} When schema, version, identifiers, or references are invalid.
 */
export function parseManifest(value: unknown): DocumentationManifest {
    const fields = objectValue(value);
    requireCondition(fields["formatVersion"] === 1, "Unsupported manifest version", "manifest-version");
    return {
        formatVersion: 1,
        source: parseSource(fields["source"]),
        pages: arrayValue(fields["pages"]).map(parsePage),
        navigation: arrayValue(fields["navigation"]).map(parseNavigation),
        files: arrayValue(fields["files"]).map(parseFile),
    };
}

/**
 * Reads repository identity and an immutable Git commit identifier.
 *
 * @param value - Untrusted source metadata.
 * @returns Validated source identity.
 * @throws {DocumentationError} For invalid source names, commits, or repository URLs.
 */
function parseSource(value: unknown): RepositorySource {
    const fields = objectValue(value);
    const repository = stringValue(fields["repository"]);
    const name = stringValue(fields["name"]);
    const commit = stringValue(fields["commit"]);
    requireCondition(/^https?:\/\/[^\s]+$/u.test(repository), "Repository must be an HTTP(S) URL");
    requireCondition(
        /^[a-zA-Z\d][a-zA-Z\d._-]*$/u.test(name) && name !== "." && name !== "..",
        "Invalid repository name",
    );
    requireCondition(/^[a-f\d]{40}(?:[a-f\d]{24})?$/u.test(commit), "Source commit must be a full Git hash");
    return { repository, name, commit, dirty: booleanValue(fields["dirty"]) };
}

/**
 * Reconstructs a page and sanitizes its complete embedded disclosures.
 *
 * @param value - Untrusted page entry.
 * @returns Validated page metadata.
 * @throws {DocumentationError} For invalid IDs, paths, or disclosure destinations.
 */
function parsePage(value: unknown): DocumentationPage {
    const fields = objectValue(value);
    const id = stringValue(fields["id"]);
    const path = archivePath(stringValue(fields["path"]));
    const sourcePath = archivePath(stringValue(fields["sourcePath"]));
    requireCondition(/^[a-z\d]+(?:-[a-z\d]+)*$/u.test(id), `Invalid page ID: ${id}`);
    requireCondition(path.endsWith(".html"), `Invalid page path: ${path}`);
    requireCondition(
        sourcePath.endsWith(".md") && htmlPath(sourcePath) === path,
        `Invalid source/output mapping: ${sourcePath}`,
    );
    return {
        id,
        path,
        title: stringValue(fields["title"]),
        sourcePath,
        copyrightAndLicence: sanitizeHtml(stringValue(fields["copyrightAndLicence"]), path),
        revisions: sanitizeHtml(stringValue(fields["revisions"]), path),
        revision: positiveInteger(fields["revision"]),
        generated: booleanValue(fields["generated"]),
        navigable: booleanValue(fields["navigable"]),
    };
}

/**
 * Reads a navigation subtree; recursion remains confined by processing workers and limits.
 *
 * @param value - Untrusted navigation entry.
 * @returns A navigation subtree.
 * @throws {DocumentationError} When required navigation fields are absent.
 */
function parseNavigation(value: unknown): NavigationEntry {
    const fields = objectValue(value);
    return {
        title: stringValue(fields["title"]),
        pageId: stringValue(fields["pageId"]),
        children: arrayValue(fields["children"]).map(parseNavigation),
    };
}

/**
 * Reads a typed inventory item.
 *
 * @param value - Untrusted inventory entry.
 * @returns A canonical inventory entry.
 * @throws {DocumentationError} When file kind or path is unsupported.
 */
function parseFile(value: unknown): ArtifactFile {
    const fields = objectValue(value);
    const kind = fields["kind"];
    requireCondition(kind === "page" || kind === "asset" || kind === "metadata", "Unsupported inventory kind");
    return { kind, path: archivePath(stringValue(fields["path"])), mediaType: stringValue(fields["mediaType"]) };
}
