/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { WebsiteConfiguration } from "./src/app/configuration";


/** Temporary source builds until project documentation archives are published. */
export default {
    projects: [
        { id: "hypatia", name: "Hypatia", source: { kind: "local", path: "../.." } },
        { id: "ryugu", name: "Ryugu", source: { kind: "local", path: "../../.cache/ryugu" } },
    ],
    documentationOrigin: "https://whiteeclipse.dev",
    landingOrigin: "https://whiteeclipse.fr",
} satisfies WebsiteConfiguration;
