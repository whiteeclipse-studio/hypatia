/* Copyright © 2026 White Eclipse. Released under the MIT License. */

/** Resource ceilings applied before and during untrusted processing. */
export interface ProcessingLimits {
    maxFiles: number;
    maxCompressedBytes: number;
    maxExpandedBytes: number;
    maxFileBytes: number;
    timeoutMs: number;
}

/** Recorded source identity; dirty builds do not represent a clean commit snapshot. */
export interface RepositorySource {
    repository: string;
    name: string;
    commit: string;
    dirty: boolean;
}

/** Embedded document disclosures, rendered separately from the article. */
export interface PageMetadata {
    id: string;
    title: string;
    copyrightAndLicence: string;
    revisions: string;
    revision: number;
}

/** One rendered page, with a stable ID and an archive-relative path. */
export interface DocumentationPage extends PageMetadata {
    path: string;
    sourcePath: string;
    generated: boolean;
    navigable: boolean;
}

/** Navigation folders open their index page and contain independently expandable children. */
export interface NavigationEntry {
    title: string;
    pageId: string;
    children: NavigationEntry[];
}

/** Inventory entry; HTML paths are article fragments rather than complete website documents. */
export interface ArtifactFile {
    path: string;
    kind: "page" | "asset" | "metadata";
    mediaType: string;
}

/** Versioned, hosting-independent TAR.GZ manifest. */
export interface DocumentationManifest {
    formatVersion: 1;
    source: RepositorySource;
    pages: DocumentationPage[];
    navigation: NavigationEntry[];
    files: ArtifactFile[];
}

/** A bounded, validated artifact held entirely in memory. */
export interface DocumentationArtifact {
    manifest: DocumentationManifest;
    files: Map<string, Uint8Array>;
}

/** Non-fatal authored-link diagnostic returned to source-build consumers. */
export interface BuildDiagnostic {
    code: "unresolved-link";
    path: string;
    message: string;
}

/** Input or generated source file; paths remain relative to docs. */
export interface SourceFile {
    path: string;
    content: Uint8Array;
}

/** Optional overrides for generated identity and inherited Markdown disclosures. */
export interface GeneratedPageMetadata {
    id?: string;
    title?: string;
    copyrightAndLicence?: string;
    revisions?: string;
}

/** Source-plugin context; repository-specific code never runs in the reader. */
export interface TransformationContext {
    source: RepositorySource;
    signal: AbortSignal;
}

/** Trusted, ordered pre-Markdown transformation of the in-memory source collection. */
export interface DocumentationPlugin {
    name: string;
    watchFiles?: string[];
    /**
     * Returns the replacement collection, including any newly generated Markdown or assets.
     *
     * @param files - Current virtual files; do not mutate the input collection.
     * @param context - Source identity and cancellation signal.
     * @returns The transformed file collection.
     * @rejects When repository-specific generation fails.
     */
    transform(files: readonly SourceFile[], context: TransformationContext): SourceFile[] | Promise<SourceFile[]>;
}

/** Configuration shared by the CLI, build API, and local Vite integration. */
export interface BuildOptions {
    repositoryRoot?: string;
    repository?: string;
    name?: string;
    commit?: string;
    plugins?: DocumentationPlugin[];
    generatedPages?: Record<string, GeneratedPageMetadata>;
    limits?: Partial<ProcessingLimits>;
}

/** Completed source build, including diagnostics and dependencies for development watching. */
export interface BuildResult extends DocumentationArtifact {
    diagnostics: BuildDiagnostic[];
    dependencies: string[];
}
