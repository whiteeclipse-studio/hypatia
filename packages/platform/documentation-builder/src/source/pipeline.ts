/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type {
    ArtifactFile,
    BuildDiagnostic,
    DocumentationArtifact,
    DocumentationManifest,
    DocumentationPage,
    GeneratedPageMetadata,
    ProcessingLimits,
    RepositorySource,
    SourceFile,
} from "../types.ts";
import type { Root } from "mdast";
import { archivePath, comparePaths } from "../paths.ts";
import { requireCondition } from "../errors.ts";
import { decodeText, validateAsset } from "../assets/index.ts";
import { checkFileLimits } from "../limits.ts";
import { validateArtifactData } from "../artifact/validate.ts";
import { documentRevision } from "../history.ts";
import { addFolderIndexes, createNavigation } from "./navigation.ts";
import {
    generatedDocument,
    enclosingReadme,
    parseMarkdown,
    prepareDocument,
    requireStandardPin,
    type PreparedDocument,
} from "./documents.ts";
import { renderMarkdown } from "./render.ts";
import type { LinkContext } from "./links.ts";
import { YAML } from "bun";

/** Serializable source-build request executed in a terminable Bun worker. */
export interface PipelineInput {
    files: SourceFile[];
    source: RepositorySource;
    generatedPages: Record<string, GeneratedPageMetadata>;
    limits: ProcessingLimits;
    licence: "none" | "markdown" | "text";
}

/** Worker output includes diagnostics without introducing them into published article content. */
export interface PipelineOutput {
    artifact: DocumentationArtifact;
    diagnostics: BuildDiagnostic[];
}

/**
 * Produces the shared manifest and sanitized file collection from transformed source files.
 *
 * @param input - Bounded, serializable source inputs.
 * @returns A validated artifact and source-link diagnostics.
 * @rejects For metadata, collision, content, or resource failures.
 */
export async function processSources(input: PipelineInput): Promise<PipelineOutput> {
    checkFileLimits(
        input.files.map(function content(file): Uint8Array {
            return file.content;
        }),
        input.limits,
    );
    const sources = sourceMap(input.files);
    const prepared = preparePages(sources, input);
    const documents = addFolderIndexes(prepared, input.generatedPages);
    requireCondition(
        new Set(
            documents.map(function id(document): string {
                return document.id;
            }),
        ).size === documents.length,
        "Duplicate document IDs",
        "collision",
    );
    requireCondition(
        new Set(
            documents.map(function path(document): string {
                return document.path;
            }),
        ).size === documents.length,
        "Conflicting page output paths",
        "collision",
    );
    const navigation = createNavigation(documents);
    const files = new Map<string, Uint8Array>();
    const inventory = await processAssets(sources, files);
    const diagnostics: BuildDiagnostic[] = [];
    const assets = new Set(files.keys());
    const pages = documents.map(function render(document): DocumentationPage {
        return renderDocument({ document, documents, assets, diagnostics }, files, inventory);
    });
    inventory.push({ path: "manifest.json", kind: "metadata", mediaType: "application/json" });
    const manifest: DocumentationManifest = {
        formatVersion: 1,
        source: input.source,
        pages,
        navigation,
        files: inventory,
    };
    putFile(files, "manifest.json", new TextEncoder().encode(JSON.stringify(manifest)));
    return { artifact: await validateArtifactData(files, input.limits), diagnostics };
}

/**
 * Rejects duplicate virtual paths after every repository-specific transformation.
 *
 * @param files - Transformed source collection.
 * @returns Sources in deterministic path order.
 * @throws {DocumentationError} For duplicate or unsafe paths.
 */
function sourceMap(files: SourceFile[]): Map<string, SourceFile> {
    const result = new Map<string, SourceFile>();
    for (const file of [...files].sort(function byPath(left, right): number {
        return comparePaths(left.path, right.path);
    })) {
        const path = archivePath(file.path);
        requireCondition(!result.has(path), `Duplicate transformed source: ${path}`, "collision");
        result.set(path, file);
    }
    return result;
}

/**
 * Prepares authored pages and the explicit root-licence exception.
 *
 * @param sources - Source files keyed by path.
 * @param input - Source-build configuration.
 * @returns Pages before folder indexes are added.
 * @throws {Error} For malformed document metadata or missing generated-page disclosures.
 */
function preparePages(sources: Map<string, SourceFile>, input: PipelineInput): PreparedDocument[] {
    const documents: PreparedDocument[] = [];
    let licenceArticle: Root | undefined;
    for (const file of sources.values()) {
        if (!file.path.endsWith(".md")) {
            continue;
        }
        const text = decodeText(file.content);
        if (
            file.path === "LICENCE.md" &&
            (input.licence === "text" ||
                (input.licence === "markdown" && !text.startsWith("---\n") && !text.startsWith("---\r\n")))
        ) {
            licenceArticle =
                input.licence === "text"
                    ? { type: "root" as const, children: [{ type: "code" as const, lang: "text", value: text }] }
                    : parseMarkdown(text);
        } else {
            requireStandardPin(file, sources);
            documents.push(prepareDocument(file));
        }
    }
    if (licenceArticle !== undefined) {
        documents.push(
            generatedDocument(
                "LICENCE.html",
                input.generatedPages["LICENCE.html"],
                licenceArticle,
                enclosingReadme("LICENCE.html", documents),
            ),
        );
    }
    return documents;
}

/**
 * Validates supporting assets, including YAML syntax through Bun's builtin parser.
 *
 * @param sources - All transformed sources.
 * @param files - Destination file map.
 * @returns Asset inventory entries.
 * @rejects For unsupported formats, malformed data, or unsafe assets.
 */
async function processAssets(
    sources: Map<string, SourceFile>,
    files: Map<string, Uint8Array>,
): Promise<ArtifactFile[]> {
    const inventory: ArtifactFile[] = [];
    for (const file of sources.values()) {
        if (file.path.endsWith(".md")) {
            continue;
        }
        if (/\.ya?ml$/iu.test(file.path)) {
            YAML.parse(decodeText(file.content));
        }
        const asset = await validateAsset(file.path, file.content);
        putFile(files, file.path, asset.content);
        inventory.push({ path: file.path, kind: "asset", mediaType: asset.mediaType });
    }
    return inventory;
}

/**
 * Renders one article and its disclosures through the same processing path.
 *
 * @param context - Current document and artifact mapping.
 * @param files - Output collection.
 * @param inventory - Output inventory.
 * @returns The page's complete manifest entry.
 * @throws {Error} For unsafe references, malformed histories, or output collisions.
 */
function renderDocument(
    context: LinkContext,
    files: Map<string, Uint8Array>,
    inventory: ArtifactFile[],
): DocumentationPage {
    const document = context.document;
    putFile(files, document.path, new TextEncoder().encode(renderMarkdown(document.article, context)));
    const revisions = renderMarkdown(document.history, {
        ...context,
        sourcePath: document.historySourcePath ?? document.sourcePath,
    });
    inventory.push({ path: document.path, kind: "page", mediaType: "text/html" });
    return {
        id: document.id,
        title: document.title,
        path: document.path,
        sourcePath: document.sourcePath,
        generated: document.generated,
        navigable: document.navigable,
        copyrightAndLicence: renderMarkdown(document.notice, {
            ...context,
            sourcePath: document.noticeSourcePath ?? document.sourcePath,
        }),
        revisions,
        revision: documentRevision(revisions),
    };
}

/**
 * Inserts an output file without silently overwriting generated pages or reserved metadata.
 *
 * @param files - Output collection.
 * @param path - New output path.
 * @param content - File contents.
 * @throws {DocumentationError} For unsafe or duplicate output paths.
 */
function putFile(files: Map<string, Uint8Array>, path: string, content: Uint8Array): void {
    archivePath(path);
    requireCondition(!files.has(path), `Conflicting output path: ${path}`, "collision");
    files.set(path, content);
}
