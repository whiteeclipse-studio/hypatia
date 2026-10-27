/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { resolve } from "node:path";
import type { Plugin } from "vite";
import { loadCatalogue } from "./load-catalogue.ts";
import { watchCatalogue } from "./watch-catalogue.ts";

const virtualId = "virtual:whiteeclipse-locales";
const resolvedId = `\0${virtualId}`;

/** Vite integration for application-local YAML translation catalogues. */
export interface I18nextPluginOptions {
    /** Application root containing src and locales; resolved from Vite's root when relative. */
    readonly root?: string;
}

/**
 * Validates and bundles every locale for browser, server, and static rendering.
 *
 * @param options - Optional application root; defaults to Vite's resolved root.
 * @returns The Vite localization plugin.
 */
export function i18nextPlugin(options: I18nextPluginOptions = {}): Plugin {
    let directory = "";
    return {
        name: "@whiteeclipse/i18next",
        /**
         * Locates the application translations after Vite resolves its configuration.
         *
         * @param config - Resolved Vite configuration.
         */
        configResolved(config) {
            directory = resolve(config.root, options.root ?? ".", "locales");
        },
        /**
         * Validates translations even when the application does not import the virtual module.
         *
         * @returns Completion of validation and dependency registration.
         * @rejects For invalid translations or filesystem errors.
         */
        async buildStart() {
            const { files } = await loadCatalogue(directory);
            this.addWatchFile(directory);
            for (const file of files) {
                this.addWatchFile(file);
            }
        },
        /**
         * Resolves the public virtual module to a private Vite identifier.
         *
         * @param id - Requested import identifier.
         * @returns The private identifier for the catalogue import, otherwise undefined.
         */
        resolveId(id) {
            return id === virtualId ? resolvedId : undefined;
        },
        /**
         * Emits validated catalogue entries without filesystem or YAML dependencies in application code.
         *
         * @param id - Resolved module identifier.
         * @returns Generated source for the catalogue, otherwise undefined.
         * @rejects For invalid translations or unreadable files.
         */
        async load(id) {
            if (id !== resolvedId) {
                return undefined;
            }
            const { catalogue } = await loadCatalogue(directory);
            const entries = Object.entries(catalogue).flatMap(([locale, namespaces]) =>
                Object.entries(namespaces).map(([namespace, messages]) => {
                    return { locale, namespace, messages };
                }),
            );
            const data = JSON.stringify(JSON.stringify(entries));
            return `import { createCatalogue } from "@whiteeclipse/i18next/catalogue";\nexport const catalogue = createCatalogue(JSON.parse(${data}));\nexport default catalogue;\n`;
        },
        /**
         * Watches translations and refreshes all environments without restarting Vite.
         *
         * @param server - The existing development server.
         */
        configureServer(server) {
            watchCatalogue(server, directory, resolvedId);
        },
    };
}
