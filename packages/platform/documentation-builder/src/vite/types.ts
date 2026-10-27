/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { BuildOptions, DocumentationArtifact, DocumentationManifest } from "../types.ts";
import type { RenderedPage, RenderOptions } from "../artifact/render-content.ts";

/** Development-only repository processing settings. */
export interface LocalDocumentationSource {
    repositoryRoot: string;
    configFile?: string;
    options?: BuildOptions;
}

/** Source selection prefers local development inputs and requires artifacts for production. */
export interface DocumentationSource {
    local?: LocalDocumentationSource;
    artifact?: string;
}

/** Vite adapter settings; paths are relative to Vite's resolved root. */
export interface DocumentationPluginOptions {
    sources: DocumentationSource[];
}

/** One validated source and its watch dependencies. */
export interface LoadedProject {
    artifact: DocumentationArtifact;
    archive: Uint8Array;
    dependencies: string[];
}

/** Public virtual-module project handle used by SSG and the hydrated application. */
export interface DocumentationProject {
    manifest: DocumentationManifest;
    artifactUrl: string;
    assetUrls: Record<string, string>;
    /**
     * Renders the immutable build-time version through the shared artifact renderer.
     *
     * @param pageId - Stable document ID.
     * @param options - Optional hosting URL overrides.
     * @returns Sanitized article and disclosures.
     * @rejects For unknown pages, unsafe mappings, or worker failures.
     */
    getPage(pageId: string, options?: RenderOptions): Promise<RenderedPage>;
}
