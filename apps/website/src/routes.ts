/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import type { DocumentationPage, RenderedPage } from "@whiteeclipse/documentation-builder/browser";

/** Serializable initial state shared by static generation and browser hydration. */
export interface WebsitePage {
    pathname: string;
    projectName: string | null;
    page: RenderedPage | null;
    notFound: boolean;
}

/**
 * Preserves artifact paths beneath the repository's URL root.
 *
 * @param name - Manifest repository name.
 * @param path - Artifact-relative HTML path.
 * @returns An origin-relative, encoded document URL.
 */
export function pageUrl(name: string, path = "index.html"): string {
    return `/${[name, ...path.split("/")].map(encodeURIComponent).join("/")}`;
}

/**
 * Matches folder aliases without allowing malformed URL escapes to break the reader.
 *
 * @param pathname - Browser URL pathname.
 * @returns A decoded artifact route, or an unmatched empty value.
 */
function normalizedPath(pathname: string): string {
    try {
        const decoded = decodeURIComponent(pathname);
        if (/^\/[^/.]+$/u.test(decoded)) {
            return `${decoded}/index.html`;
        }
        return decoded.endsWith("/") ? `${decoded}index.html` : decoded;
    } catch {
        return "";
    }
}

/**
 * Compares static routes with their directory aliases before hydration.
 *
 * @param generated - Path recorded in the generated page.
 * @param requested - Browser URL path, possibly served by a static-host fallback.
 * @returns Whether the same article should be hydrated.
 */
export function sameRoute(generated: string, requested: string): boolean {
    return normalizedPath(generated) === normalizedPath(requested);
}

/**
 * Finds a page by its published path, including README directory aliases.
 *
 * @param project - Validated project snapshot.
 * @param pathname - Requested URL path.
 * @returns Its manifest entry when the project owns this path.
 */
export function findPage(project: DocumentationProject, pathname: string): DocumentationPage | undefined {
    const path = normalizedPath(pathname);
    const root = `/${project.manifest.source.name}`;
    return project.manifest.pages.find(function matches(page): boolean {
        return `${root}/${page.path}` === path || (path === root && page.path === "index.html");
    });
}

/**
 * Uses the builder's sanitizing rendering path in both development and static generation.
 *
 * @param projects - Validated snapshots from the Vite adapter.
 * @param pathname - Requested URL path.
 * @returns Article state, the project directory, or a missing-page state.
 * @rejects When the shared artifact renderer cannot render a matched page.
 */
export async function loadPage(projects: DocumentationProject[], pathname: string): Promise<WebsitePage> {
    for (const project of projects) {
        const page = findPage(project, pathname);
        if (page !== undefined) {
            return {
                pathname,
                projectName: project.manifest.source.name,
                page: await project.getPage(page.id),
                notFound: false,
            };
        }
    }
    return {
        pathname,
        projectName: null,
        page: null,
        notFound: !["/", "/index.html"].includes(pathname),
    };
}

/**
 * Builds a page-specific HTML title from manifest metadata.
 *
 * @param state - Loaded route state.
 * @returns A title for browser tabs and static metadata.
 */
export function pageTitle(state: WebsitePage): string {
    if (state.notFound) {
        return "Page not found · White Eclipse";
    }
    return `${state.page?.title ?? "Documentation"} · ${state.projectName ?? "White Eclipse"}`;
}
