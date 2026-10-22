/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { fileURLToPath } from "node:url";
import type {
    DocumentationPage,
    DocumentationPublication,
    DocumentationRepository,
    DocumentSummary,
} from "../../content/types";
import { loadCatalogue, type DocumentationCatalogue } from "./catalogue";
import { convertDocument, summarizeDocument } from "./convert";
import { contentLimits } from "./files";

/** Explicit local working-tree source used only in development. */
export const documentationRoot = fileURLToPath(new URL("../../../../../docs/", import.meta.url));

/** Configured application cache; never included in the deployable output. */
export const documentationCache = fileURLToPath(new URL("../../../.cache/", import.meta.url));

/** Aggregated navigation with isolated per-repository conversion and link resolution. */
export interface DocumentationSite {
    base: string;
    catalogues: DocumentationCatalogue[];
    repositories: DocumentationRepository[];
    documents: DocumentSummary[];
}

/**
 * Combines source inventories without merging project-scoped identifiers or link boundaries.
 *
 * @param catalogues - Independently validated source trees.
 * @returns Shared navigation and repository landing routes.
 * @throws {Error} If repository names are duplicated or a source has no canonical English entry.
 */
export function createSite(catalogues: DocumentationCatalogue[]): DocumentationSite {
    const repositories: DocumentationRepository[] = [];
    const base = catalogues[0]?.base ?? "/";
    for (const catalogue of catalogues) {
        const entry =
            catalogue.documents.find(document => document.sourcePath === "README.md") ??
            catalogue.documents.find(document => document.language === "en");
        if (
            entry === undefined ||
            catalogue.base !== base ||
            repositories.some(repository => repository.name === catalogue.repository)
        ) {
            throw new Error(`Invalid or duplicate repository catalogue: ${catalogue.repository}`);
        }
        repositories.push({ name: catalogue.repository, title: catalogue.title, route: entry.route });
    }
    return {
        base,
        catalogues,
        repositories,
        documents: catalogues.flatMap(catalogue => catalogue.documents.map(summarizeDocument)),
    };
}

/**
 * Creates the overview or converts the requested Markdown page directly from current local sources.
 *
 * @param site - Isolated source inventories for this request or build.
 * @param route - Published URL pathname.
 * @returns The page snapshot, or undefined for an unpublished path.
 * @rejects If Markdown conversion fails.
 */
export async function loadPage(site: DocumentationSite, route: string): Promise<DocumentationPage | undefined> {
    const { base, documents, repositories } = site;
    if (route === base) {
        return { base, route, repositories, documents, article: null };
    }
    const catalogue = site.catalogues.find(entry => entry.documents.some(document => document.route === route));
    const source = catalogue?.documents.find(document => document.route === route);
    if (source === undefined || catalogue === undefined) {
        return undefined;
    }
    return { base, route, repositories, documents, article: await convertDocument(source, catalogue) };
}

/**
 * Converts every English document and translation before a build can be published.
 *
 * @param site - Validated repository snapshots shared by all pages in this build.
 * @returns The complete rendered publication used by the SSG renderer.
 * @rejects If any document cannot be converted.
 */
export async function compilePublication(site: DocumentationSite): Promise<DocumentationPublication> {
    const articles = [];
    for (const catalogue of site.catalogues) {
        const deadline = Date.now() + contentLimits.milliseconds;
        for (const document of catalogue.documents) {
            articles.push(await convertDocument(document, catalogue));
            if (Date.now() > deadline) {
                throw new Error("Documentation conversion exceeded its processing time limit.");
            }
        }
    }
    return { base: site.base, repositories: site.repositories, documents: site.documents, articles };
}

/**
 * Discovers the configured local Hypatia documentation tree on demand.
 *
 * @returns Current local sources rather than a cached build snapshot.
 * @rejects If source discovery or metadata validation fails.
 */
export async function loadLocalCatalogue(): Promise<DocumentationCatalogue> {
    return loadCatalogue(documentationRoot, "hypatia", "Hypatia");
}
