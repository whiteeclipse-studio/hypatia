/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { posix } from "node:path";
import { toString } from "mdast-util-to-string";
import type { DocumentSummary } from "../../content/types";
import { contentLimits, discoverContent, readContentFile } from "./files";
import { markdownParser } from "./markdown";

/** Discovered source and metadata used only by the application-controlled converter. */
export interface SourceDocument extends DocumentSummary {
    markdown: string;
    sourceId?: string;
    standardRevision?: number;
}

/** One isolated documentation tree with project-scoped identifiers and translations. */
export interface DocumentationCatalogue {
    base: string;
    repository: string;
    title: string;
    root: string;
    documents: SourceDocument[];
    assets: string[];
}

/**
 * Creates the published route while preserving the source directory structure.
 *
 * @param path - Source file path relative to docs.
 * @param repository - Validated source repository name.
 * @param base - Application mount path, including its trailing slash.
 * @returns The URL under the source repository folder.
 */
export function contentRoute(path: string, repository: string, base = "/"): string {
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    return `${base}${repository}/${encoded.replace(/\.md$/, ".html")}`;
}

/**
 * Reads required front matter without interpreting it as executable configuration.
 *
 * @param value - Parsed YAML value.
 * @param path - Source used in errors.
 * @returns Metadata with a valid stable identifier.
 * @throws {Error} If metadata or the stable identifier is missing or invalid.
 */
function requireMetadata(value: unknown, path: string): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value) || !("id" in value)) {
        throw new Error(`Missing document metadata: ${path}`);
    }
    if (typeof value.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id)) {
        throw new Error(`Invalid document identifier: ${path}`);
    }
    return value;
}

/**
 * Associates mirrored translation filenames with their authoritative English path.
 *
 * @param path - Source path relative to docs.
 * @returns The canonical path and normalized BCP 47 language tag.
 * @throws {Error} If a translation filename does not follow the standard.
 */
function identifyLanguage(path: string): { canonicalPath: string; language: string } {
    const translationPrefix = "translations/";
    if (!path.startsWith(translationPrefix)) {
        return { canonicalPath: path, language: "en" };
    }
    const mirrored = path.slice(translationPrefix.length);
    const match = /^(?<stem>.*)\.(?<locale>[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*)\.md$/.exec(mirrored);
    const stem = match?.groups?.["stem"];
    const locale = match?.groups?.["locale"];
    if (stem === undefined || locale === undefined) {
        throw new Error(`Invalid mirrored translation filename: ${path}`);
    }
    const language = Intl.getCanonicalLocales(locale)[0];
    if (language === undefined || language === "en") {
        throw new Error(`Invalid translation language or mirrored path: ${path}`);
    }
    return { canonicalPath: `${stem}.md`, language };
}

/**
 * Validates optional revision pins and the required translation source reference.
 *
 * @param metadata - Parsed front matter.
 * @param path - Source used in errors.
 * @param language - Authored document language.
 * @returns Validated revision and translation fields.
 * @throws {Error} If the revision or translation metadata is invalid.
 */
function sourceMetadata(
    metadata: Record<string, unknown>,
    path: string,
    language: string,
): Pick<SourceDocument, "standardRevision" | "sourceId" | "sourceReference"> {
    const result: Pick<SourceDocument, "standardRevision" | "sourceId" | "sourceReference"> = {};
    const revision = metadata["standard_revision"];
    if (revision !== undefined) {
        if (typeof revision !== "number" || !Number.isInteger(revision) || revision <= 0) {
            throw new Error(`Invalid standard_revision: ${path}`);
        }
        result.standardRevision = revision;
    }
    if (language !== "en") {
        const sourceId = metadata["source_id"];
        const reference = metadata["source_reference"];
        if (typeof sourceId !== "string" || typeof reference !== "string" || !reference.startsWith("https://")) {
            throw new Error(`Translation requires source_id and a canonical source_reference: ${path}`);
        }
        result.sourceId = sourceId;
        result.sourceReference = reference;
    }
    return result;
}

/**
 * Parses a document's front matter, identity, and first heading.
 *
 * @param root - Configured docs directory.
 * @param path - Relative Markdown path.
 * @param context - Source identity and publication mount.
 * @returns The source document, without rendering imported HTML or code.
 * @rejects If reading, YAML parsing, or metadata validation fails.
 */
async function readDocument(
    root: string,
    path: string,
    context: Pick<DocumentationCatalogue, "repository" | "title" | "base">,
): Promise<SourceDocument> {
    const markdown = (await readContentFile(root, path, contentLimits.markdownBytes)).toString("utf8");
    const tree = markdownParser.parse(markdown);
    const frontmatter = tree.children.find(node => node.type === "yaml");
    const value: unknown = frontmatter?.type === "yaml" ? Bun.YAML.parse(frontmatter.value) : undefined;
    const metadata = requireMetadata(value, path);
    const identity = identifyLanguage(path);
    const heading = tree.children.find(node => node.type === "heading" && node.depth === 1);
    const document: SourceDocument = {
        repository: context.repository,
        repositoryTitle: context.title,
        id: String(metadata["id"]),
        sourcePath: path,
        ...identity,
        ...sourceMetadata(metadata, path, identity.language),
        route: contentRoute(path, context.repository, context.base),
        title: heading === undefined ? posix.basename(identity.canonicalPath, ".md") : toString(heading),
        markdown,
    };

    return document;
}

/**
 * Discovers local sources and verifies translation identity, canonical paths, and revision pins.
 *
 * @param root - Application-configured docs root.
 * @param repository - Validated source repository name.
 * @param title - Human-readable source title.
 * @param base - Application mount path, including its trailing slash.
 * @returns English sources, validated translations, and eligible supporting assets.
 * @rejects If sources are unreadable, duplicated, invalid, or orphaned translations.
 */
export async function loadCatalogue(
    root: string,
    repository: string,
    title: string,
    base = "/",
): Promise<DocumentationCatalogue> {
    const deadline = Date.now() + contentLimits.milliseconds;
    const files = await discoverContent(root);
    const documents: SourceDocument[] = [];
    const identifiers = new Set<string>();
    for (const path of files.markdown) {
        const document = await readDocument(root, path, { repository, title, base });
        if (Date.now() > deadline) {
            throw new Error("Documentation metadata processing exceeded its time limit.");
        }
        if (identifiers.has(document.id)) {
            throw new Error(`Duplicate document identifier: ${document.id}`);
        }
        identifiers.add(document.id);
        documents.push(document);
    }
    validateTranslations(documents);
    if (documents.length === 0) {
        throw new Error(`Repository has no publishable Markdown documents: ${repository}`);
    }
    return { root, repository, title, base, documents, assets: files.assets };
}

/**
 * Checks mirrored translations against their canonical English identity and revision pin.
 *
 * @param documents - Complete set of parsed sources.
 * @throws {Error} If a translation is duplicated, orphaned, or mismatched.
 */
function validateTranslations(documents: readonly SourceDocument[]): void {
    const variants = new Set<string>();
    for (const document of documents) {
        const key = `${document.canonicalPath}:${document.language}`;
        if (variants.has(key)) {
            throw new Error(`Duplicate document translation: ${document.sourcePath}`);
        }
        variants.add(key);
        if (document.language === "en") {
            continue;
        }
        const source = documents.find(entry => entry.language === "en" && entry.sourcePath === document.canonicalPath);
        if (
            source === undefined ||
            source.id !== document.sourceId ||
            (source.standardRevision !== undefined && source.standardRevision !== document.standardRevision)
        ) {
            throw new Error(`Translation does not match its English source: ${document.sourcePath}`);
        }
    }
}
