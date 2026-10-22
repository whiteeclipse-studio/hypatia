/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readFile } from "node:fs/promises";
import type { Hono } from "hono";
import { createPageApp } from "./app";
import { renderDocument } from "./document";
import { render } from "./render";

/**
 * Creates the built application used for both SSR requests and static generation.
 *
 * @param templatePath - Saved Vite HTML template, separate from generated pages.
 * @returns An application rendering pages with the built asset URLs.
 *
 * @rejects If the built HTML template cannot be read.
 */
export async function createBuiltApp(templatePath: string): Promise<Hono> {
    const template = await readFile(templatePath, "utf8");
    return createPageApp(async (_url, acceptLanguage) => {
        const page = await render(acceptLanguage);
        return renderDocument(template, page.html, page);
    });
}
