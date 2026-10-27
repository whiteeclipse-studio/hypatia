/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { isAbsolute, relative, sep } from "node:path";
import type { ViteDevServer } from "vite";

/**
 * Invalidates browser and server catalogues on YAML additions, changes, and removals.
 *
 * @param server - The existing Vite development server.
 * @param directory - The application's locales directory.
 * @param moduleId - Internal identifier of the generated catalogue module.
 */
export function watchCatalogue(server: ViteDevServer, directory: string, moduleId: string): void {
    /**
     * Refreshes each environment and requests a page reload for a relevant source event.
     *
     * @param file - Added, changed, or removed file path.
     */
    function reload(file: string): void {
        const path = relative(directory, file);
        if (path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path) || !path.endsWith(".yaml")) {
            return;
        }
        for (const environment of Object.values(server.environments)) {
            const module = environment.moduleGraph.getModuleById(moduleId);
            if (module !== undefined) {
                environment.moduleGraph.invalidateModule(module);
            }
            environment.hot.send({ type: "full-reload" });
        }
    }

    /** Removes listeners when the watcher closes. */
    function cleanup(): void {
        server.watcher.off("add", reload).off("change", reload).off("unlink", reload);
    }

    server.watcher.add(directory);
    server.watcher.on("add", reload).on("change", reload).on("unlink", reload);
    server.watcher.once("close", cleanup);
}
