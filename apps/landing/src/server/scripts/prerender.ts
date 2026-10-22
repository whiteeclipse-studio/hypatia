/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Hono } from "hono";

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
 * Saves only the default landing document; translations are selected at runtime.
 *
 * @param app - Application using the built React renderer and HTML template.
 * @param directory - Directory to publish as a static site.
 *
 * @returns Completion after the single landing document has been written.
 * @rejects If a route fails or a generated document cannot be written.
 */
export async function prerender(app: Hono, directory: string): Promise<void> {
    const response = requireSuccessfulPage(await app.request("/"));
    await writeFile(join(directory, "index.html"), await response.text(), "utf8");
}
