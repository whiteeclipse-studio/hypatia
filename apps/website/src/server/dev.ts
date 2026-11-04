/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import configuration from "../../website.config";
import { createSources } from "./sources";
import { normalizedRoute } from "../modules/documentation/domain/routes";
import type { Bootstrap } from "../modules/documentation/domain/types";
import { renderingModuleSchema } from "../rendering/module";
import { z } from "zod";
import { parseAcceptLanguage, selectLocale, type TranslationCatalogue } from "@whiteeclipse/i18next";
import { httpStatus, timing } from "../shared/constants";


const defaultPort = 20100;
const port = Number(process.env["PORT"] ?? defaultPort);
const root = fileURLToPath(new URL("../..", import.meta.url));
const sources = await createSources(configuration, true, root);
const server = createHttpServer((request, response) => {
    void respond(request, response).catch(error => {
        fail(error, response);
    });
});
const vite = await createServer({ root, server: { middlewareMode: true, ws: { server } }, appType: "custom" });

/**
 * Reports request failures without exposing source paths in the response.
 *
 * @param error The error value.
 * @param response The response value.
 */
function fail(error: unknown, response: ServerResponse): void {
    if (error instanceof Error) {
        vite.ssrFixStacktrace(error);
    }
    process.stderr.write(`${String(error)}\n`);
    if (!response.headersSent) {
        response.writeHead(httpStatus.error);
    }
    response.end("Unable to render documentation. See development server output.");
}

/**
 * Delivers source-change notifications without pre-rendering any page.
 *
 * @param request The request value.
 * @param response The response value.
 */
function events(request: IncomingMessage, response: ServerResponse): void {
    response.writeHead(httpStatus.ok, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    response.write(": connected\n\n");
    const unsubscribe = sources.subscribe(() => {
        response.write("data: changed\n\n");
    });
    const heartbeat = setInterval(() => {
        response.write(": keepalive\n\n");
    }, timing.heartbeat);
    request.on("close", () => {
        clearInterval(heartbeat);
        unsubscribe();
    });
}

/**
 * Serves development-only data and refresh endpoints.
 *
 * @param url The url value.
 * @param request The request value.
 * @param response The response value.
 * @returns The prepared result.
 */
function data(url: URL, request: IncomingMessage, response: ServerResponse): boolean {
    if (url.pathname === "/__docs/events") {
        events(request, response);
        return true;
    }
    if (url.pathname === "/__docs/indexes") {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(sources.indexes()));
        return true;
    }
    if (url.pathname === "/__docs/page") {
        const page = sources.get(url.searchParams.get("project") ?? "")?.pages[url.searchParams.get("route") ?? ""];
        response.writeHead(page === undefined ? httpStatus.notFound : httpStatus.ok, {
            "Content-Type": "application/json",
        });
        response.end(JSON.stringify(page ?? { error: "Page not found" }));
        return true;
    }
    if (url.pathname === "/__docs/refresh" && request.method === "POST") {
        sources.refresh(url.searchParams.get("project") ?? "");
        response.writeHead(httpStatus.accepted);
        response.end();
        return true;
    }
    return false;
}

/**
 * Serves a validated source asset from the current owned project generation.
 *
 * @param url The url value.
 * @param response The response value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function asset(url: URL, response: ServerResponse): Promise<void> {
    const [, , id, generation, ...parts] = decodeURIComponent(url.pathname).split("/");
    const project = sources.get(id ?? "");
    const blob =
        project !== undefined && project.index.generation === generation ? project.assets[parts.join("/")] : undefined;
    if (blob === undefined) {
        response.writeHead(httpStatus.notFound);
        response.end();
        return;
    }
    response.setHeader("Content-Type", blob.type);
    response.end(Buffer.from(await blob.arrayBuffer()));
}

/**
 * Renders exactly the document requested after Vite handles module and asset requests.
 *
 * @param request The request value.
 * @param response The response value.
 * @param url The url value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function renderRequest(request: IncomingMessage, response: ServerResponse, url: URL): Promise<void> {
    const route = normalizedRoute(url.pathname);
    const project = sources.indexes().find(index => route.startsWith(`/${index.project.id}/`));
    const page = project === undefined ? undefined : sources.get(project.project.id)?.pages[route];
    const rendering = renderingModuleSchema.parse(await vite.ssrLoadModule("/src/rendering/server.tsx"));
    const locales = z
        .object({ catalogue: z.custom<TranslationCatalogue>(value => typeof value === "object" && value !== null) })
        .parse(await vite.ssrLoadModule("/src/shared/i18n/session.ts"));
    const available = { ...locales.catalogue };
    for (const index of sources.indexes()) {
        for (const entry of index.entries) {
            available[entry.locale] ??= {};
        }
    }
    const bootstrap: Bootstrap = {
        module: "documentation",
        locale: selectLocale(parseAcceptLanguage(request.headers["accept-language"]), available),
        indexes: sources.indexes(),
        development: true,
    };
    if (page !== undefined) {
        bootstrap.page = page;
    }
    const body = await rendering.render(bootstrap, route);
    const html = rendering.htmlDocument(bootstrap, body, {
        assets: '<link rel="stylesheet" href="/src/shared/theme/styles.css"><script type="module" src="/src/app/client.tsx"></script>',
        route,
        origin: configuration.documentationOrigin,
    });
    response.writeHead(route === "/" || page !== undefined ? httpStatus.ok : httpStatus.notFound, {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
    });
    response.end(await vite.transformIndexHtml(route, html));
}

/**
 * Routes data, assets and on-demand document requests.
 *
 * @param request The request value.
 * @param response The response value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function respond(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (data(url, request, response)) {
        return;
    }
    if (url.pathname.startsWith("/_assets/")) {
        await asset(url, response);
        return;
    }
    vite.middlewares(request, response, () => {
        void renderRequest(request, response, url).catch(error => {
            fail(error, response);
        });
    });
}
server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`Documentation explorer: http://localhost:${port}\n`);
});

/**
 * Drains development resources before process shutdown.
 *
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function close(): Promise<void> {
    server.close();
    await vite.close();
    await sources[Symbol.asyncDispose]();
    process.exit(0);
}
process.once("SIGINT", () => {
    void close();
});
process.once("SIGTERM", () => {
    void close();
});
