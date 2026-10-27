/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { renderToString } from "react-dom/server";
import { projects } from "virtual:whiteeclipse-documentation";
import { App } from "../src/app.tsx";
import { loadPage, pageTitle, pageUrl, type WebsitePage } from "../src/routes.ts";
import { writeInventory } from "./inventory.ts";

/**
 * Escapes plain metadata for inclusion in an HTML title or attribute.
 *
 * @param value - Untrusted metadata text.
 * @returns HTML-safe text.
 */
function escapeHtml(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/**
 * Embeds the identical React state used for SSG, escaping script-closing sequences.
 *
 * @param template - Client bundle's HTML template.
 * @param state - Sanitized page and route metadata.
 * @returns Complete hydratable HTML containing the article before JavaScript runs.
 */
function renderHtml(template: string, state: WebsitePage): string {
    const data = JSON.stringify(state).replaceAll("<", "\\u003c");
    const markup = renderToString(<App projects={projects} state={state} />);
    const title = escapeHtml(pageTitle(state));
    const description = escapeHtml(
        `${state.page?.title ?? "Documentation"} — ${state.projectName ?? "White Eclipse project documentation"}`,
    );
    return template
        .replace("<!--app-html-->", function content(): string {
            return markup;
        })
        .replace("<!--page-data-->", function bootstrap(): string {
            return `<script type="application/json" id="website-page">${data}</script>`;
        })
        .replace("<title>Documentation · White Eclipse</title>", function metadata(): string {
            return `<title>${title}</title>`;
        })
        .replace('content="Read White Eclipse project documentation."', function metadata(): string {
            return `content="${description}"`;
        });
}

/**
 * Writes every artifact page, including directly addressable pages omitted from navigation.
 *
 * @param output - Staged client output directory.
 * @returns Completion after HTML and an actual-output inventory are written.
 * @rejects For render failures, missing templates, or filesystem failures.
 */
export async function prerender(output: string): Promise<void> {
    const template = await readFile(resolve(output, "index.html"), "utf8");
    const routes = ["/", "/404.html"];
    for (const project of projects) {
        for (const page of project.manifest.pages) {
            routes.push(pageUrl(project.manifest.source.name, page.path));
        }
    }
    for (const route of routes) {
        const state = await loadPage(projects, route);
        const file = resolve(output, route === "/" ? "index.html" : decodeURIComponent(route.slice(1)));
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, renderHtml(template, state));
    }
    await writeInventory(output, projects);
    process.stdout.write(`Generated ${routes.length} static documentation pages.\n`);
}
