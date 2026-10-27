/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Element } from "hast";
import type { ArtifactFile, DocumentationPage } from "../types.ts";
import { requireCondition } from "../errors.ts";
import { sanitizeHtml, parseReference } from "../html.ts";
import { encodePath } from "../paths.ts";
import { hasControls } from "../text.ts";

/** Hosting-specific URL resolution; generated artifacts themselves remain hosting-independent. */
export interface RenderOptions {
    projectRoot?: string;
    assetUrls?: Readonly<Record<string, string>>;
}

/** Article and disclosures remain separate so consumers can implement document controls. */
export interface RenderedPage {
    id: string;
    title: string;
    html: string;
    copyrightAndLicence: string;
    revisions: string;
    revision: number;
}

/** Serializable render task used identically by SSR and browser workers. */
export interface RenderInput {
    page: DocumentationPage;
    html: string;
    assets: ArtifactFile[];
    repositoryName: string;
    options: RenderOptions;
}

/**
 * Sanitizes again and resolves all destinations against artifact paths before display.
 *
 * @param input - Validated page, asset inventory, and trusted host URL mapping.
 * @returns An article and independent complete disclosures.
 * @throws {DocumentationError} For unsafe destinations, project roots, or asset mappings.
 */
export function renderContent(input: RenderInput): RenderedPage {
    const root = input.options.projectRoot ?? `/${input.repositoryName}/`;
    requireCondition(/^\/(?:[a-zA-Z\d_-][a-zA-Z\d._-]*\/)+$/u.test(root), "Invalid project URL root", "unsafe-link");
    const assets = new Map(
        input.assets.map(function keyed(asset): [string, ArtifactFile] {
            return [asset.path, asset];
        }),
    );
    /**
     * Resolves a sanitized link against the artifact, including cached Blob assets.
     *
     * @param url - Original artifact-relative URL.
     * @param element - Sanitized containing element.
     * @returns A trusted host URL or unchanged external URL.
     */
    function rewrite(url: string, element: Element): string {
        const reference = parseReference(url, input.page.path);
        if (reference.external || url.startsWith("#") || url.startsWith("?")) {
            return url;
        }
        const asset = assets.get(reference.path);
        if (asset !== undefined) {
            markDownload(element, asset);
            return `${assetDestination(reference.path, root, input.options)}${reference.suffix}`;
        }
        return `${root}${encodePath(reference.path)}${reference.suffix}`;
    }
    return {
        id: input.page.id,
        title: input.page.title,
        revision: input.page.revision,
        html: sanitizeHtml(input.html, input.page.path, rewrite),
        copyrightAndLicence: sanitizeHtml(input.page.copyrightAndLicence, input.page.path, rewrite),
        revisions: sanitizeHtml(input.page.revisions, input.page.path, rewrite),
    };
}

/**
 * Requires PDF destinations to be downloads rather than embedded active documents.
 *
 * @param element - Sanitized URL-bearing element.
 * @param asset - Validated asset entry.
 * @throws {DocumentationError} For embedded non-image assets.
 */
function markDownload(element: Element, asset: ArtifactFile): void {
    requireCondition(
        element.tagName !== "img" || asset.mediaType.startsWith("image/"),
        "Only images may be embedded",
        "unsafe-asset",
    );
    if (element.tagName === "a" && !asset.mediaType.startsWith("image/")) {
        // eslint-disable-next-line no-param-reassign -- annotate the sanitized AST with a download-only destination.
        element.properties.download = asset.path.split("/").pop() ?? "download";
    }
}

/**
 * Accepts only trusted application mappings suitable for inert assets.
 *
 * @param path - Archive-relative asset path.
 * @param root - Project URL root.
 * @param options - Application-provided asset mappings.
 * @returns A static or Blob asset URL.
 * @throws {DocumentationError} For unsafe application mappings.
 */
function assetDestination(path: string, root: string, options: RenderOptions): string {
    const url = options.assetUrls?.[path] ?? `${root}${encodePath(path)}`;
    requireCondition(
        /^(?:blob:|https?:\/\/|\/(?!\/))/u.test(url) && !hasControls(url, true),
        "Invalid asset URL mapping",
        "unsafe-link",
    );
    return url;
}
