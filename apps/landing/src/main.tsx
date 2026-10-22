/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@whiteeclipse/core-ui/styles.css";
import { App } from "./app";
import "./styles/global.css";
import { configureI18next } from "@whiteeclipse/i18next";

/**
 * Hydrates the server-rendered landing page in development and built deployments.
 * This remains exploratory work under draft RFC-0001, RFC-0002, and Core UI.
 *
 * @throws {Error} If the HTML entrypoint does not contain the required root element.
 * @returns Completion after the server-rendered locale snapshot has been attached to React.
 * @rejects If the translation context cannot initialize.
 */
async function mountLandingPage(): Promise<void> {
    const container = document.getElementById("root");
    if (!container) {
        throw new Error("The landing page requires a #root element.");
    }

    config.autoAddCss = false;
    const i18next = await configureI18next({ lng: document.documentElement.lang, defaultNS: "interface" });
    const page = (
        <StrictMode>
            <App i18n={i18next} />
        </StrictMode>
    );
    hydrateRoot(container, page);
}

await mountLandingPage();
