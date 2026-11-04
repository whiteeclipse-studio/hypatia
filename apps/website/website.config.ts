/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { WebsiteConfiguration } from "./src/app/configuration";


/** Local paths stay on the server. Configure update URLs when archives are hosted. */
export default {
    projects: [
        { id: "hypatia", name: "Hypatia", source: { kind: "local", path: "../.." } },
        { id: "ryugu", name: "Ryugu", source: { kind: "local", path: "../../../ryugu" } },
    ],
    documentationOrigin: "https://hypatia.local.whiteeclipse.dev",
    landingOrigin: "https://whiteeclipse.fr",
} satisfies WebsiteConfiguration;
