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

/** Server module loaded and invalidated by Vite on source changes. */
interface RenderModule {
    /**
     * Renders the React application.
     *
     * @param acceptLanguage - Incoming request language preferences.
     * @returns The hydratable page and metadata.
     * @rejects If rendering fails.
     */
    render(acceptLanguage?: string): Promise<RenderedPage>;
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
 * @returns A complete server-rendered HTML document.
 *
 * @rejects If loading, HTML transformation, or React rendering fails.
 */
async function renderPage(url: string, acceptLanguage?: string): Promise<string> {
    try {
        const template = await vite.transformIndexHtml(url, await readFile(templatePath, "utf8"));
        const module: unknown = await vite.ssrLoadModule("/src/server/render.tsx");
        if (!isRenderModule(module)) {
            throw new Error("The SSR module must export a render function.");
        }
        const page = await module.render(acceptLanguage);
        return renderDocument(template, page.html, page);
    } catch (error) {
        if (error instanceof Error) {
            vite.ssrFixStacktrace(error);
        }
        throw error;
    }
}

const app = createPageApp(renderPage);
const listener = getRequestListener(app.fetch, { overrideGlobalObjects: false });
vite.middlewares.use((request, response) => {
    listener(request, response).catch((error: unknown) => {
        process.stderr.write(`${String(error)}\n`);
        response.destroy(error instanceof Error ? error : undefined);
    });
});
server.on("request", vite.middlewares);
server.listen(Number(process.env["PORT"] ?? "5173"), process.env["HOST"] ?? "127.0.0.1", () => {
    const address = server.address();
    if (address !== null && typeof address !== "string") {
        process.stdout.write(`Landing SSR: http://${address.address}:${address.port}\n`);
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
