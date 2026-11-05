/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { App } from "../app/app";
import { createDocumentationStore } from "../modules/documentation/store/store";
import { catalogue, createWebsiteSession } from "../shared/i18n/session";
import { z } from "zod";
import type { Bootstrap } from "../modules/documentation/domain/types";
import "../shared/theme/styles.css";


const icons = `<link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png"><link rel="icon" type="image/x-icon" href="/favicon/favicon.ico"><link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg"><link rel="apple-touch-icon" sizes="1024x1024" href="/favicon/apple-touch-icon.png">`;
const landingMetadata = z.object({ title: z.string(), description: z.string() });
/**
 * Renders one route using isolated documentation and localization state.
 *
 * @param bootstrap The bootstrap value.
 * @param route The route value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
export async function render(bootstrap: Bootstrap, route: string): Promise<string> {
    const session = await createWebsiteSession(bootstrap.locale);
    return renderToString(
        <StaticRouter location={route}>
            <App bootstrap={bootstrap} store={createDocumentationStore(bootstrap)} session={session} />
        </StaticRouter>,
    );
}
/**
 * Escapes text for HTML attributes and metadata.
 *
 * @param value The value value.
 * @returns The prepared result.
 */
export function escapeHtml(value: string): string {
    return value.replace(
        /[&<>"']/g,
        character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character,
    );
}
/**
 * Wraps rendered markup with metadata and escaped hydration data.
 *
 * @param bootstrap The bootstrap value.
 * @param body The body value.
 * @param options The options value.
 * @returns The prepared result.
 * @param options.assets The assets input.
 * @param options.route The route input.
 * @param options.origin The origin input.
 * @param options.fallback The fallback input.
 */
export function htmlDocument(
    bootstrap: Bootstrap,
    body: string,
    options: { assets: string; route: string; origin: string; fallback?: boolean },
): string {
    const { assets, route, origin, fallback = false } = options;
    const metadata =
        bootstrap.module === "landing"
            ? landingMetadata.parse(
                  catalogue[bootstrap.locale]?.["landing"]?.["metadata"] ?? catalogue["en"]?.["landing"]?.["metadata"],
              )
            : undefined;
    const title = metadata?.title ?? bootstrap.page?.title ?? "White Eclipse · Documentation";
    const description = metadata?.description ?? `${title} — White Eclipse documentation`;
    const manifest = bootstrap.module === "landing" ? "" : '<link rel="manifest" href="/manifest.webmanifest">';
    const json = JSON.stringify(bootstrap)
        .replace(/</g, "\\u003c")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
    return `<!doctype html><html lang="${escapeHtml(bootstrap.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(description)}"><title>${escapeHtml(title)}</title><link rel="canonical" href="${escapeHtml(new URL(route, origin).href)}">${icons}${manifest}${assets}</head><body><div id="root"${fallback ? ' data-fallback="true"' : ""}>${body}</div><script id="bootstrap" type="application/json">${json}</script></body></html>`;
}
