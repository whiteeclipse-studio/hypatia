/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { renderToStaticMarkup } from "react-dom/server";

/** Localized document information matching the rendered React application. */
interface DocumentMetadata {
    language: string;
    title: string;
    description: string;
}

const requiredParts = 2;
const outlet = "<!--app-html-->";

/**
 * Escapes a locale identifier for an HTML attribute.
 *
 * @param value - Locale selected from application resources.
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
 * @param metadata - Localized metadata matching the initial HTML snapshot.
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
    }
    return document;
}
