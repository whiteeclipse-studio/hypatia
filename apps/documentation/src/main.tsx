/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { configureI18next } from "@whiteeclipse/i18next";
import "@whiteeclipse/core-ui/styles.css";
import { App } from "./app";
import "./styles/global.css";
import { parsePage } from "./content/snapshot";

/**
 * Hydrates the server-rendered scaffold under draft RFC-0001 and RFC-0002.
 *
 * @throws {Error} If the HTML entrypoint is missing its root element.
 * @returns Completion after the server-rendered locale snapshot is attached to React.
 * @rejects If translation initialization fails.
 */
async function mountDocumentation(): Promise<void> {
    const container = document.getElementById("root");
    if (container === null) {
        throw new Error("The documentation application requires a #root element.");
    }

    const i18n = await configureI18next({ lng: document.documentElement.lang, defaultNS: "interface" });
    const data = document.getElementById("documentation-page-data");
    if (data === null) {
        throw new Error("The documentation page requires its server-rendered snapshot.");
    }
    const page = parsePage(data.textContent);
    hydrateRoot(
        container,
        <StrictMode>
            <App i18n={i18n} page={page} />
        </StrictMode>,
    );
}

await mountDocumentation();
