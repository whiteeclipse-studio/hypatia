/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { createRoot, hydrateRoot } from "react-dom/client";
import { projects } from "virtual:whiteeclipse-documentation";
import { App } from "./app.tsx";
import { loadPage, pageTitle, sameRoute } from "./routes.ts";
import { parseBootstrap } from "./bootstrap.ts";
import "./styles/index.css";

/**
 * Hydrates generated HTML, or renders a local development route through the same reader.
 *
 * @returns Completion after installing the React root.
 * @rejects For unavailable root elements, corrupt bootstrap data, or rendering failures.
 */
async function start(): Promise<void> {
    const root = document.getElementById("root");
    if (root === null) {
        throw new Error("The website root is missing.");
    }
    const bootstrap = document.getElementById("website-page");
    const initial = bootstrap === null ? null : parseBootstrap(bootstrap.textContent);
    const hydrate = initial !== null && sameRoute(initial.pathname, window.location.pathname);
    const state = hydrate ? initial : await loadPage(projects, window.location.pathname);
    document.title = pageTitle(state);
    const app = <App projects={projects} state={state} />;
    if (hydrate) {
        hydrateRoot(root, app);
    } else {
        createRoot(root).render(app);
    }
}

start().catch(function reportFailure(error: unknown): void {
    const root = document.getElementById("root");
    if (root !== null && root.childElementCount === 0) {
        const message = document.createElement("p");
        message.setAttribute("role", "alert");
        message.textContent = "Documentation could not be loaded. Reload the page to try again.";
        root.replaceChildren(message);
    }
    // Preserve readable static content if hydration fails; surface the underlying failure to browser tooling.
    window.reportError(error);
});
