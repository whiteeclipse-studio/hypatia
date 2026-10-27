/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { isAbsolute, relative, resolve, sep } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { loadLocaleFiles } from "./resources.ts";

const virtualId = "virtual:whiteeclipse-locales";
const resolvedId = `\0${virtualId}`;

/** Vite integration for application-local YAML namespaces. */
export interface I18nextPluginOptions {
    /** Application root containing src and locales; defaults to Vite's root. */
    root?: string;
}

/**
 * Bundles all YAML resources for browser and server/SSG builds and reloads on locale edits.
 *
 * @param options - Optional application root, useful for Storybook's Vite configuration.
 * @returns The Vite localization plugin.
 */
export function i18nextPlugin(options: I18nextPluginOptions = {}): Plugin {
    let directory = "";
    return {
        name: "@whiteeclipse/i18next",

        /**
         * Resolves the application locales directory after Vite has resolved its root.
         *
         * @param config - Resolved Vite configuration.
         */
        configResolved(config) {
            directory = resolve(config.root, options.root ?? ".", "locales");
        },

        /**
         * Validates all namespaces even when the virtual module is not imported.
         *
         * @returns Completion of resource validation and watch registration.
         * @rejects On invalid YAML, collisions, or filesystem errors.
         */
        async buildStart() {
            const { files } = await loadLocaleFiles(directory);
            this.addWatchFile(directory);
            for (const file of files) {
                this.addWatchFile(file);
            }
        },

        /**
         * Resolves the resource module without pulling Node-only code into application bundles.
         *
         * @param id - Requested module identifier.
         * @returns The internal module identifier when handled.
         */
        resolveId(id) {
            return id === virtualId ? resolvedId : undefined;
        },
        /**
         * Emits every locale as JavaScript data, including for server and static generation.
         *
         * @param id - Resolved module identifier.
         * @returns Module source when handled.
         * @rejects On invalid locale sources or unreadable files.
         */
        async load(id) {
            if (id !== resolvedId) {
                return undefined;
            }
            const { resources } = await loadLocaleFiles(directory);
            const data = JSON.stringify(JSON.stringify(resources));
            return `export const resources = JSON.parse(${data});\nexport default resources;\n`;
        },
        /**
         * Watches additions, modifications, and removals, using a full reload to refresh resources.
         *
         * @param server - Development server to watch and invalidate.
         */
        configureServer(server) {
            watchLocales(server, directory);
        },
    };
}

/**
 * Installs locale watchers and removes listeners when Vite closes.
 *
 * @param server - Vite development server.
 * @param directory - Application locales directory.
 */
function watchLocales(server: ViteDevServer, directory: string): void {
    /**
     * Refreshes browser and server module graphs and requests a page reload.
     *
     * @param file - Added, changed, or removed source path.
     */
    function reload(file: string): void {
        const path = relative(directory, file);
        if (path.startsWith(`..${sep}`) || isAbsolute(path) || !path.endsWith(".yaml")) {
            return;
        }
        for (const environment of Object.values(server.environments)) {
            const module = environment.moduleGraph.getModuleById(resolvedId);
            if (module !== undefined) {
                environment.moduleGraph.invalidateModule(module);
            }
            environment.hot.send({ type: "full-reload" });
        }
    }
    /** Removes event listeners after server shutdown. */
    function cleanup(): void {
        server.watcher.off("add", reload).off("change", reload).off("unlink", reload);
    }
    server.watcher.add(directory);
    server.watcher.on("add", reload).on("change", reload).on("unlink", reload);
    server.watcher.once("close", cleanup);
}
