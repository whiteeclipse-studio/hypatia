/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app";
import { createDocumentationStore } from "../modules/documentation/store/store";
import { createWebsiteSession } from "../shared/i18n/session";
import { bootstrapSchema, indexesSchema } from "../modules/documentation/domain/validation";
import "../shared/theme/styles.css";


const element = document.getElementById("root");
const payload = document.getElementById("bootstrap");
if (element === null || payload === null) {
    throw new Error("Website bootstrap is missing.");
}
const bootstrap = bootstrapSchema.parse(JSON.parse(payload.textContent));
// The static fallback has no prerendered page; discover current static project inventories.
if (element.dataset["fallback"] === "true") {
    const response = await fetch("/_data/catalogue.json");
    if (response.ok) {
        bootstrap.indexes = indexesSchema.parse(await response.json());
    }
}
const store = createDocumentationStore(bootstrap);
const session = await createWebsiteSession(bootstrap.locale);
const app = (
    <BrowserRouter>
        <App bootstrap={bootstrap} store={store} session={session} />
    </BrowserRouter>
);
if (element.dataset["fallback"] === "true") {
    createRoot(element).render(app);
} else {
    hydrateRoot(element, app);
}
