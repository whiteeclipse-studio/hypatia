/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { Root } from "hast";
import type { DocumentRevision } from "@whiteeclipse/docs-compiler";
import type { PublicProject } from "../../../app/configuration";


/**
 * Describes entry.
 */
export interface Entry {
    path: string;
    route: string;
    id: string;
    title: string;
    navigable: boolean;
    locale: string;
    sourceId?: string | undefined;
}
/**
 * Describes project index.
 */
export interface ProjectIndex {
    project: PublicProject;
    generation: string;
    entries: Entry[];
    assets: Record<string, string>;
}
/**
 * Describes document data.
 */
export interface DocumentData {
    title: string;
    tree: Root;
    copyrightAndLicence: Root;
    revisions: readonly DocumentRevision[];
}
/**
 * Describes page data.
 */
export interface PageData {
    route: string;
    title: string;
    variants: Record<string, DocumentData>;
    directory: boolean;
}
/**
 * Describes prepared project.
 */
export interface PreparedProject {
    index: ProjectIndex;
    pages: Record<string, PageData>;
    assets: Record<string, Blob>;
}
/**
 * Describes bootstrap.
 */
export interface Bootstrap {
    module: "landing" | "documentation";
    locale: string;
    indexes: ProjectIndex[];
    page?: PageData | undefined;
    development: boolean;
}
/**
 * Identifies a page within one immutable project generation.
 *
 * @param index The index value.
 * @param route The route value.
 * @returns The prepared result.
 */
export function pageKey(index: ProjectIndex, route: string): string {
    return `${index.project.id}:${index.generation}:${route}`;
}
/**
 * Maps a project page to its versioned static data resource.
 *
 * @param index The index value.
 * @param route The route value.
 * @returns The prepared result.
 */
export function pageDataUrl(index: ProjectIndex, route: string): string {
    return `/_data/${index.project.id}/${index.generation}/${encodeURIComponent(route)}.json`;
}
