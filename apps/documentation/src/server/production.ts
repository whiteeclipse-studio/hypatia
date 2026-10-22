/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readFile } from "node:fs/promises";
import type { Hono } from "hono";
import { createPageApp } from "./app";
import { renderDocument } from "./document";
import { render } from "./render";
import { resolve, dirname } from "node:path";
import { parsePublication } from "../content/snapshot";

/**
 * Creates the build-time page application from converted content for static generation.
 *
 * @param templatePath - Saved Vite HTML template, separate from generated pages.
 * @returns An application rendering pages with the built asset URLs.
 *
 * @rejects If the built template or converted publication is missing or invalid.
 */
export async function createBuiltApp(templatePath: string): Promise<Hono> {
    const template = await readFile(templatePath, "utf8");
    const publication = parsePublication(await readFile(resolve(dirname(templatePath), "publication.json"), "utf8"));
    return createPageApp(async (url, acceptLanguage) => {
        const route = new URL(url).pathname;
        const article = publication.articles.find(document => document.route === route) ?? null;
        if (article === null && route !== publication.base) {
            return new Response("Not found", { status: 404 });
        }
        const page = await render(
            {
                base: publication.base,
                route,
                repositories: publication.repositories,
                documents: publication.documents,
                article,
            },
            acceptLanguage,
        );
        return new Response(renderDocument(template, page.html, page), {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    });
}
