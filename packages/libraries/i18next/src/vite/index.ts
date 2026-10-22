/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { resolve } from "node:path";
import type { Plugin } from "vite";
import { compileLocale, createRegistry, discoverLocales, isLocaleFile } from "./locales";

const publicId = "virtual:whiteeclipse-i18next";
const resolvedId = `\0${publicId}`;

/** Source location for application-owned YAML localization namespaces. */
export interface I18nextPluginOptions {
    localesDirectory?: string;
}

/**
 * Loads application locales with Bun-native YAML parsing in Vite development and builds.
 * The root runtime export stays independent of Bun and Vite.
 *
 * @param options - Locale directory, resolved relative to the Vite application root.
 * @returns The Vite plugin providing virtual:whiteeclipse-i18next.
 */
export function i18nextPlugin(options: I18nextPluginOptions = {}): Plugin {
    let directory = "";
    return {
        name: "vite-plugin-whiteeclipse-i18next",
        enforce: "pre",

        /**
         * Resolves the application's locale directory and checks the required parser runtime.
         *
         * @param config - Resolved Vite application configuration.
         * @throws {Error} If Vite is not running through Bun.
         */
        configResolved(config) {
            if (typeof Bun === "undefined") {
                throw new Error("@whiteeclipse/i18next/vite requires Vite to run through Bun.");
            }
            directory = resolve(config.root, options.localesDirectory ?? "locales");
        },

        /**
         * Watches the locale tree so adding or removing a namespace triggers a reload.
         *
         * @param server - Active Vite development server.
         */
        configureServer(server) {
            server.watcher.add(directory);
        },

        /**
         * Resolves the public virtual resource module.
         *
         * @param source - Requested module specifier.
         * @returns The internal module identifier when this plugin owns the import.
         */
        resolveId(source) {
            return source === publicId ? resolvedId : undefined;
        },

        /**
         * Builds the resource registry or compiles an application-local YAML namespace.
         *
         * @param id - Resolved module identifier.
         * @returns Generated JavaScript, or nothing for modules owned by other plugins.
         * @rejects If locale discovery or YAML compilation fails.
         */
        async load(id) {
            if (id === resolvedId) {
                const files = await discoverLocales(directory);
                for (const entry of files) {
                    this.addWatchFile(entry.file);
                }
                return createRegistry(files);
            }
            if (isLocaleFile(id, directory)) {
                return compileLocale(id);
            }
            return undefined;
        },

        /**
         * Invalidates both SSR and browser resources when locale files change.
         *
         * @param context - Created, changed, or deleted locale source.
         * @returns An empty update list after sending a full browser reload for locale changes.
         */
        hotUpdate(context) {
            if (!isLocaleFile(context.file, directory)) {
                return undefined;
            }
            for (const environment of Object.values(context.server.environments)) {
                const module = environment.moduleGraph.getModuleById(resolvedId);
                if (module !== undefined) {
                    environment.moduleGraph.invalidateModule(module);
                }
            }
            if (this.environment.name === "client") {
                this.environment.hot.send({ type: "full-reload" });
            }
            return [];
        },
    };
}
