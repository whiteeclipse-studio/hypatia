/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { StrictMode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { config } from "@fortawesome/fontawesome-svg-core";
import { App } from "../app";
import { configureI18next } from "@whiteeclipse/i18next";

/** Rendered application and localized document metadata for one request. */
export interface RenderedPage {
    html: string;
    language: string;
    title: string;
    description: string;
}

/**
 * Renders the shared exploratory React tree, waiting for all Suspense content.
 *
 * @param acceptLanguage - Request language preferences; omitted for the default static snapshot.
 * @returns Hydratable HTML and matching localized document metadata.
 * @rejects If React cannot render the page.
 */
export async function render(acceptLanguage?: string): Promise<RenderedPage> {
    config.autoAddCss = false;
    const i18n = await configureI18next({
        ...(acceptLanguage === undefined ? {} : { acceptLanguage }),
        defaultNS: "interface",
    });
    const errors: unknown[] = [];
    const stream = await renderToReadableStream(
        <StrictMode>
            <App i18n={i18n} />
        </StrictMode>,
        {
            /**
             * Records recoverable React errors so the build cannot publish a fallback page.
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
        title: i18n.t("landing:metadata.title"),
        description: i18n.t("landing:metadata.description"),
    };
}
