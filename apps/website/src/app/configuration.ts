/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
export type DocumentationSource = { kind: "local"; path: string } | { kind: "archive"; url: string };
/**
 * Describes public project.
 */
export interface PublicProject {
    id: string;
    name: string;
    archiveUrl?: string | undefined;
    updateTtlMs?: number | undefined;
}
/**
 * Describes project configuration.
 */
export interface ProjectConfiguration extends PublicProject {
    source: DocumentationSource;
    buildSource?: DocumentationSource | undefined;
}
/**
 * Describes website configuration.
 */
export interface WebsiteConfiguration {
    projects: ProjectConfiguration[];
    documentationOrigin: string;
    landingOrigin: string;
}
export const defaultUpdateTtlMs = 86_400_000;
