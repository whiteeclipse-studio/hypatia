/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Hono } from "hono";

/** Produces a complete HTML document for a page request. */
export type RenderPage = (url: string, acceptLanguage?: string) => string | Promise<string>;

/**
 * Registers the page routes shared by development, built SSR, and static generation.
 * This remains exploratory work under draft RFC-0001, RFC-0002, and Core UI.
 *
 * @param renderPage - Renderer for the current environment.
 * @returns The application without a listening server or asset middleware.
 */
export function createPageApp(renderPage: RenderPage): Hono {
    const app = new Hono();
    app.get("/", async context => {
        context.header("Vary", "Accept-Language");
        return context.html(await renderPage(context.req.url, context.req.header("Accept-Language")));
    });
    return app;
}
