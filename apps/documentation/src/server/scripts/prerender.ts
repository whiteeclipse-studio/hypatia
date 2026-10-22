/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import type { Hono } from "hono";
import { isWithinDocs } from "../content/files";
import { pageContentSecurityPolicy } from "./output";

/**
 * Prevents error responses from being published as generated pages.
 *
 * @param response - Response returned by the page application.
 * @returns The successful page response.
 * @throws {Error} If rendering returned an unsuccessful HTTP status.
 */
function requireSuccessfulPage(response: Response): Response {
    if (!response.ok) {
        throw new Error(`Static rendering failed with HTTP ${response.status}.`);
    }
    return response;
}

/**
 * Saves every published document and translation as independently readable static HTML.
 *
 * @param app - Application using the built React renderer and HTML template.
 * @param directory - Directory to publish as a static site.
 * @param routes - Complete published route inventory, including the site overview.
 * @param base - URL mount to remove when writing into the application's client output.
 *
 * @returns Completion after every route has been written successfully.
 * @rejects If a route fails or a generated document cannot be written.
 */
export async function prerender(app: Hono, directory: string, routes: readonly string[], base = "/"): Promise<void> {
    for (const route of routes) {
        if (!route.startsWith(base)) {
            throw new Error(`Static page does not belong to the application mount: ${route}`);
        }
        const path = route.slice(base.length);
        const output = resolve(directory, path === "" ? "index.html" : decodeURIComponent(path));
        if (!isWithinDocs(relative(directory, output))) {
            throw new Error(`Static page output escapes its destination: ${route}`);
        }
        const response = requireSuccessfulPage(await app.request(route));
        const metaPolicy = pageContentSecurityPolicy.replace("; frame-ancestors 'none'", "");
        const html = (await response.text()).replace(
            "<head>",
            `<head><meta http-equiv="Content-Security-Policy" content="${metaPolicy}">`,
        );
        await mkdir(dirname(output), { recursive: true });
        await writeFile(output, html, "utf8");
    }
}
