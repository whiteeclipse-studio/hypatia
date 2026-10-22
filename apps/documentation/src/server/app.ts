/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Hono } from "hono";

/** Produces the requested page, supporting asset, or unpublished-route response. */
export type RenderPage = (url: string, acceptLanguage?: string) => Promise<Response>;

/**
 * Registers the page routes shared by development, built SSR, and static generation.
 * This remains exploratory work under draft RFC-0001, RFC-0002, and Core UI.
 *
 * @param renderPage - Renderer for the current environment.
 * @returns The application without a listening server or asset middleware.
 */
export function createPageApp(renderPage: RenderPage): Hono {
    const app = new Hono();
    app.get("*", async context => {
        const response = await renderPage(context.req.url, context.req.header("Accept-Language"));
        response.headers.set("Vary", "Accept-Language");
        return response;
    });
    return app;
}
