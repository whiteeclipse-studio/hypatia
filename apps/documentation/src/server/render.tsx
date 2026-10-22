/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { StrictMode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { App } from "../app";
import { configureI18next } from "@whiteeclipse/i18next";
import type { DocumentationPage } from "../content/types";

/** Rendered application and document metadata for one request or static snapshot. */
export interface RenderedPage {
    html: string;
    language: string;
    title: string;
    description: string;
    page: DocumentationPage;
}

/**
 * Renders the exploratory React scaffold, waiting for all Suspense content.
 *
 * @param page - Current article and document navigation snapshot.
 * @param acceptLanguage - Request preferences for the overview; documents start with their authored locale.
 * @returns Hydratable HTML and matching document metadata.
 * @rejects If React cannot render the complete page.
 */
export async function render(page: DocumentationPage, acceptLanguage?: string): Promise<RenderedPage> {
    const i18n = await configureI18next({
        ...(acceptLanguage === undefined ? {} : { acceptLanguage }),
        defaultNS: "interface",
        ...(page.article === null ? {} : { lng: page.article.language }),
    });
    const errors: unknown[] = [];
    const stream = await renderToReadableStream(
        <StrictMode>
            <App i18n={i18n} page={page} />
        </StrictMode>,
        {
            /**
             * Records React errors so a build cannot publish a fallback page.
             *
             * @param error - Rendering failure reported by React.
             */
            onError(error: unknown) {
                errors.push(error);
            },
        },
    );
    await stream.allReady;
    if (errors.length > 0) {
        throw new Error("React could not render the complete page.", { cause: errors[0] });
    }
    return {
        html: await new Response(stream).text(),
        language: i18n.resolvedLanguage ?? "en",
        title: page.article === null ? i18n.t("metadata.title") : `${page.article.title} · White Eclipse`,
        description: i18n.t("metadata.description"),
        page,
    };
}
