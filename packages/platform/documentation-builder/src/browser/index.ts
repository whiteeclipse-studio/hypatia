/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { renderPage } from "../artifact/render.ts";
import type { RenderedPage } from "../artifact/render-content.ts";
import type { DocumentationArtifact, DocumentationManifest, DocumentationPage } from "../types.ts";
import { requireCondition } from "../errors.ts";

export { downloadArtifact, downloadWithFallback, type DownloadOptions, type DownloadOutcome } from "./download.ts";
export { loadArtifact, validateArtifact } from "../artifact/index.ts";
export type { DocumentationArtifact, DocumentationManifest, DocumentationPage, RenderedPage };

/** A framework-independent browser view with explicit Blob URL ownership. */
export interface ArtifactReader {
    /**
     * Renders a page with asset URLs backed by the loaded artifact bytes.
     *
     * @param pageId - Stable page identifier.
     * @returns Sanitized article and disclosure content.
     * @rejects For unknown pages, disposed readers, or rendering failures.
     */
    render(pageId: string): Promise<RenderedPage>;
    /** Revokes all owned Blob URLs; subsequent rendering fails. */
    dispose(): void;
}

/**
 * Creates an in-memory browser reader without filesystem APIs or repository-specific plugins.
 *
 * @param artifact - Previously validated artifact.
 * @param projectRoot - Optional website URL root for documentation links.
 * @returns A reader whose dispose method must be called when the artifact is replaced.
 * @throws {DocumentationError} For missing artifact assets.
 */
export function createArtifactReader(artifact: DocumentationArtifact, projectRoot?: string): ArtifactReader {
    const urls: Record<string, string> = {};
    let disposed = false;
    for (const file of artifact.manifest.files) {
        if (file.kind !== "asset") {
            continue;
        }
        const bytes = artifact.files.get(file.path);
        requireCondition(bytes !== undefined, `Missing asset: ${file.path}`);
        urls[file.path] = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: file.mediaType }));
    }
    return {
        /**
         * Resolves an article against owned artifact assets.
         *
         * @param pageId - Requested page.
         * @returns Sanitized rendering content.
         * @rejects For disposed readers or invalid pages.
         */
        async render(pageId): Promise<RenderedPage> {
            requireCondition(!disposed, "Artifact reader has been disposed", "disposed");
            return renderPage(artifact, pageId, {
                ...(projectRoot === undefined ? {} : { projectRoot }),
                assetUrls: urls,
            });
        },
        /** Revokes URLs once and prevents further rendering. */
        dispose(): void {
            Object.values(urls).forEach(function revoke(url): void {
                URL.revokeObjectURL(url);
            });
            disposed = true;
        },
    };
}
