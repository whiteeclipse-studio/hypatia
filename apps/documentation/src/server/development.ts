/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { getRequestListener } from "@hono/node-server";
import { createServer as createViteServer } from "vite";
import { createPageApp } from "./app";
import { renderDocument } from "./document";
import type { RenderedPage } from "./render";
import type { DocumentationPage } from "../content/types";
import { documentationRoot, documentationCache, createSite, loadLocalCatalogue, loadPage } from "./content/site";
import { contentRoute, loadCatalogue, type DocumentationCatalogue } from "./content/catalogue";
import { loadRepositories } from "./repositories/load";
import { repositories } from "./repositories/configuration";
import { assetContentSecurityPolicy, loadAsset } from "./content/assets";
import { relative } from "node:path";
import { isWithinDocs } from "./content/files";

/** Server module loaded and invalidated by Vite on source changes. */
interface RenderModule {
    /**
     * Renders the React application.
     *
     * @param page - The requested Markdown page and navigation inventory.
     * @param acceptLanguage - Incoming request language preferences.
     * @returns The hydratable page and metadata.
     * @rejects If rendering fails.
     */
    render(page: DocumentationPage, acceptLanguage?: string): Promise<RenderedPage>;
}

/**
 * Checks the runtime boundary exposed by Vite's untyped module loader.
 *
 * @param value - Loaded module exports.
 * @returns Whether a render function is available.
 */
function isRenderModule(value: unknown): value is RenderModule {
    return typeof value === "object" && value !== null && "render" in value && typeof value.render === "function";
}

// Remote snapshots are refreshed once at startup, never as a side effect of requesting a page.
// Hypatia uses its live working tree in development; release builds import its remote main like every other source.
const sources = await loadRepositories(
    repositories.filter(repository => repository.name !== "hypatia"),
    documentationCache,
);
const remoteCatalogues: DocumentationCatalogue[] = [];
try {
    for (const repository of sources.repositories) {
        remoteCatalogues.push(
            await loadCatalogue(repository.docsRoot, repository.configuration.name, repository.configuration.title),
        );
    }
} catch (error) {
    await sources.dispose();
    throw error;
}
const server = createServer();
const vite = await createViteServer({
    configFile: fileURLToPath(new URL("./config/vite.config.ts", import.meta.url)),
    appType: "custom",
    server: { middlewareMode: { server }, hmr: { server } },
});
const templatePath = fileURLToPath(new URL("../../index.html", import.meta.url));

/**
 * Loads fresh server modules and applies Vite's development HTML transforms per request.
 *
 * @param url - Incoming absolute page URL.
 * @param acceptLanguage - Incoming request language preferences.
 * @returns The requested HTML, sanitized image, or unpublished-route response.
 *
 * @rejects If loading, HTML transformation, or React rendering fails.
 */
async function renderPage(url: string, acceptLanguage?: string): Promise<Response> {
    try {
        const site = createSite([...remoteCatalogues, await loadLocalCatalogue()]);
        const route = new URL(url).pathname;
        const catalogue = site.catalogues.find(entry =>
            entry.assets.some(path => contentRoute(path, entry.repository) === route),
        );
        const asset = catalogue?.assets.find(path => contentRoute(path, catalogue.repository) === route);
        if (asset !== undefined && catalogue !== undefined) {
            const image = await loadAsset(catalogue.root, asset);
            return new Response(new Uint8Array(image.bytes).buffer, {
                headers: {
                    "Content-Type": image.contentType,
                    "Content-Security-Policy": assetContentSecurityPolicy,
                    "X-Content-Type-Options": "nosniff",
                },
            });
        }
        const snapshot = await loadPage(site, route);
        if (snapshot === undefined) {
            return new Response("Not found", { status: 404 });
        }
        const template = await vite.transformIndexHtml(url, await readFile(templatePath, "utf8"));
        const module: unknown = await vite.ssrLoadModule("/src/server/render.tsx");
        if (!isRenderModule(module)) {
            throw new Error("The SSR module must export a render function.");
        }
        const page = await module.render(snapshot, acceptLanguage);
        return new Response(renderDocument(template, page.html, page), {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    } catch (error) {
        if (error instanceof Error) {
            vite.ssrFixStacktrace(error);
        }
        throw error;
    }
}

const app = createPageApp(renderPage);
vite.watcher.add(documentationRoot);
/**
 * Reloads the page only for changes inside the configured documentation tree.
 *
 * @param path - File reported by the Vite watcher.
 */
function reloadDocumentation(path: string): void {
    if (isWithinDocs(relative(documentationRoot, path))) {
        vite.hot.send({ type: "full-reload" });
    }
}
vite.watcher.on("change", reloadDocumentation).on("add", reloadDocumentation).on("unlink", reloadDocumentation);
const listener = getRequestListener(app.fetch, { overrideGlobalObjects: false });
vite.middlewares.use((request, response) => {
    listener(request, response).catch((error: unknown) => {
        process.stderr.write(`${String(error)}\n`);
        response.destroy(error instanceof Error ? error : undefined);
    });
});
server.on("request", vite.middlewares);
server.listen(Number(process.env["PORT"] ?? "5174"), process.env["HOST"] ?? "127.0.0.1", () => {
    const address = server.address();
    if (address !== null && typeof address !== "string") {
        process.stdout.write(`Documentation SSR: http://${address.address}:${address.port}\n`);
    }
});

/**
 * Closes Vite's watchers, HMR connections, and the development listener.
 *
 * @returns Completion after development resources have closed.
 * @rejects If Vite cannot close its resources.
 */
async function close(): Promise<void> {
    await vite.close();
    server.close();
    await sources.dispose();
}

process.once("SIGINT", () => {
    close().catch((error: unknown) => {
        process.stderr.write(`${String(error)}\n`);
        process.exitCode = 1;
    });
});
process.once("SIGTERM", () => {
    close().catch((error: unknown) => {
        process.stderr.write(`${String(error)}\n`);
        process.exitCode = 1;
    });
});
