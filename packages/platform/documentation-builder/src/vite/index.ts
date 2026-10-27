/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Plugin } from "vite";
import { requireCondition } from "../errors.ts";
import { configureDevelopment } from "./development.ts";
import { loadProjects } from "./sources.ts";
import { projectOutputs, virtualModule } from "./output.ts";
import type {
    DocumentationPluginOptions,
    DocumentationProject,
    DocumentationSource,
    LocalDocumentationSource,
    LoadedProject,
} from "./types.ts";

export type { DocumentationPluginOptions, DocumentationProject, DocumentationSource, LocalDocumentationSource };

const virtualId = "virtual:whiteeclipse-documentation";
const resolvedId = `\0${virtualId}`;

/**
 * Shares documentation snapshots across local development, SSR, and hydrated browser consumers.
 *
 * @param options - Configured source repositories and artifact locations.
 * @returns The Vite documentation plugin.
 */
export function documentationPlugin(options: DocumentationPluginOptions): Plugin {
    let root = "";
    let base = "/";
    let development = false;
    let projects: LoadedProject[] = [];
    /**
     * Replaces snapshots only after all sources validate.
     *
     * @returns Completion after loading all projects.
     * @rejects For source, archive, download, or project-root failures.
     */
    async function refresh(): Promise<void> {
        projects = await loadProjects(options.sources, root, development);
    }
    return {
        name: "@whiteeclipse/documentation-builder",
        /**
         * Resolves source paths and the hosting base.
         *
         * @param config - Resolved Vite configuration.
         */
        configResolved(config): void {
            root = config.root;
            base = config.base;
            development = config.command === "serve";
            requireCondition(
                base.startsWith("/") && base.endsWith("/") && !base.startsWith("//"),
                "Documentation requires an origin-relative Vite base",
                "configuration",
            );
        },
        /**
         * Validates sources even when the virtual module is unused.
         *
         * @returns Completion after dependency registration.
         * @rejects For unavailable or invalid sources.
         */
        async buildStart(): Promise<void> {
            await refresh();
            for (const project of projects) {
                project.dependencies.forEach(this.addWatchFile.bind(this));
            }
        },
        /**
         * Resolves the documentation virtual module.
         *
         * @param id - Requested module.
         * @returns The internal module identifier when handled.
         */
        resolveId(id): string | undefined {
            return id === virtualId ? resolvedId : undefined;
        },
        /**
         * Serializes the current shared snapshot.
         *
         * @param id - Resolved module identifier.
         * @returns Module source when handled.
         */
        load(id): string | undefined {
            return id === resolvedId ? virtualModule(projects, base) : undefined;
        },
        /**
         * Adds asset serving and source invalidation in development.
         *
         * @param server - Vite development server.
         */
        configureServer(server): void {
            configureDevelopment(server, {
                /**
                 * Exposes the last validated snapshots to development middleware.
                 *
                 * @returns Current project snapshots.
                 */
                projects(): LoadedProject[] {
                    return projects;
                },
                refresh,
                base,
                virtualId: resolvedId,
            });
        },
        /** Emits assets and fallback archives separately from website-generated pages. */
        generateBundle(): void {
            for (const project of projects) {
                for (const output of projectOutputs(project)) {
                    this.emitFile({ type: "asset", fileName: output.path, source: output.content });
                }
            }
        },
    };
}
