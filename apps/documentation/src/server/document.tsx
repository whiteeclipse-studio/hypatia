/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationPage } from "../content/types";

/** Document information matching the rendered React application. */
interface DocumentMetadata {
    language: string;
    title: string;
    description: string;
    page?: DocumentationPage;
}

const requiredParts = 2;
const outlet = "<!--app-html-->";

/**
 * Escapes a language identifier for an HTML attribute.
 *
 * @param value - Language of the rendered document.
 * @returns HTML-safe attribute text.
 */
function escapeAttribute(value: string): string {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return value.replace(/[&<>"']/g, character => entities[character] ?? character);
}

/**
 * Inserts React markup into the Vite-transformed HTML document.
 *
 * @param template - HTML containing exactly one application outlet.
 * @param markup - Hydratable React HTML.
 * @param metadata - Metadata matching the initial HTML snapshot.
 *
 * @returns The complete document, preserving Vite's asset links and head metadata.
 * @throws {Error} If the template does not contain exactly one outlet.
 */
export function renderDocument(template: string, markup: string, metadata?: DocumentMetadata): string {
    if (template.split(outlet).length !== requiredParts) {
        throw new Error("The HTML template must contain exactly one application outlet.");
    }
    let document = template.replace(outlet, () => markup);
    if (metadata !== undefined) {
        const head = renderToStaticMarkup(
            <>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
            </>,
        );
        document = document
            .replace("<!--page-head-->", () => head)
            .replace('lang="en"', () => `lang="${escapeAttribute(metadata.language)}"`);
        if (metadata.page !== undefined) {
            const json = JSON.stringify(metadata.page)
                .replace(/</g, "\\u003c")
                .replace(/\u2028/g, "\\u2028")
                .replace(/\u2029/g, "\\u2029");
            document = document.replace(
                "</head>",
                () => `<script id="documentation-page-data" type="application/json">${json}</script></head>`,
            );
        }
    }
    return document;
}
