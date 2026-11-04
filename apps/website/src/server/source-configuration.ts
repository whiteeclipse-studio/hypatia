/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { resolve } from "node:path";
import type { CompilerPlugin } from "@whiteeclipse/docs-compiler";
import { filesystemLoader } from "@whiteeclipse/docs-compiler/packages/filesystem-loader";
import { markdownParser } from "@whiteeclipse/docs-compiler/packages/markdown-parser";
import { linkResolver } from "@whiteeclipse/docs-compiler/packages/link-resolver";
import { archiveReader } from "@whiteeclipse/docs-compiler/packages/archive-reader";
import type { ProjectConfiguration } from "../app/configuration";


/**
 * Validates project identifiers and browser update configuration before source loading.
 *
 * @param projects The projects value.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export function validateProjects(projects: ProjectConfiguration[]): void {
    const ids = new Set<string>();
    for (const project of projects) {
        if (!/^[a-z0-9][a-z0-9_-]*$/.test(project.id) || ids.has(project.id)) {
            throw new Error(`Invalid or duplicate project ID: ${project.id}`);
        }
        ids.add(project.id);
        if (project.updateTtlMs !== undefined && (!Number.isFinite(project.updateTtlMs) || project.updateTtlMs <= 0)) {
            throw new Error("Update TTL must be positive.");
        }
        if (project.archiveUrl === undefined) {
            continue;
        }
        const url = new URL(project.archiveUrl);
        if (
            !/^https?:$/.test(url.protocol) ||
            url.username !== "" ||
            url.password !== "" ||
            url.hash !== "" ||
            !/\.(?:tgz|tar\.gz)$/.test(url.pathname)
        ) {
            throw new Error("Invalid update archive URL.");
        }
    }
}

/**
 * Selects server-only plugins for local authoring or precompiled archives.
 *
 * @param project The project value.
 * @param development The development value.
 * @param root The root value.
 * @param refreshers The refreshers value.
 * @returns The prepared result.
 */
export function sourceConfiguration(
    project: ProjectConfiguration,
    development: boolean,
    root: string,
    refreshers: Map<string, () => void>,
): { repositories: string; plugins: CompilerPlugin[] } {
    const source = development ? project.source : (project.buildSource ?? project.source);
    if (source.kind === "archive") {
        return {
            repositories: URL.canParse(source.url) ? source.url : resolve(root, source.url),
            plugins: [
                archiveReader({
                    subscribe(_source, changed) {
                        refreshers.set(project.id, changed);
                        return () => {
                            refreshers.delete(project.id);
                        };
                    },
                }),
            ],
        };
    }
    return {
        repositories: resolve(root, source.path),
        plugins: [
            markdownParser({ wikilinks: true, callouts: true }),
            filesystemLoader({ cwd: root, translations: true }),
            linkResolver(),
        ],
    };
}
