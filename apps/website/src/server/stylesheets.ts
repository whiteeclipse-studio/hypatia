/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ViteDevServer } from "vite";


/**
 * Includes CSS Modules discovered during SSR before the browser's first paint.
 *
 * @param server The development server with the loaded rendering module graph.
 * @returns Stylesheet links using Vite's direct CSS responses and scoped class names.
 */
export function moduleStylesheets(server: ViteDevServer): string {
    const graph = server.environments.ssr.moduleGraph;
    const styles = new Set<string>();
    for (const module of graph.idToModuleMap.values()) {
        if (module.url.endsWith(".module.css")) {
            styles.add(module.url);
        }
    }
    return [...styles].map(url => `<link rel="stylesheet" href="${encodeURI(url)}?direct">`).join("");
}
