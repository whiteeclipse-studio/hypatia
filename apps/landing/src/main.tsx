import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@whiteeclipse/core-ui/styles.css";
import { App } from "./app";
import "./styles/global.css";


/**
 * Hydrates the static landing build, or mounts the empty development entrypoint.
 * This remains exploratory work under draft RFC-0001, RFC-0002, and Core UI.
 * @throws {Error} If the HTML entrypoint does not contain the required root element.
 */
function mountLandingPage() {
    const container = document.getElementById("root");
    if (!container) {
        throw new Error("The landing page requires a #root element.");
    }

    config.autoAddCss = false;
    const page = <StrictMode><App /></StrictMode>;
    if (container.hasChildNodes()) {
        hydrateRoot(container, page);
    } else {
        createRoot(container).render(page);
    }
}

mountLandingPage();
