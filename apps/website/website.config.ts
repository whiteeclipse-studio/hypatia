/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { WebsiteConfiguration } from "./src/app/configuration.ts";


/** Local paths stay on the server. Configure update URLs when archives are hosted. */
export default {
    projects: [
        { id: "hypatia", name: "Hypatia", source: { kind: "local", path: "../.." } },
        { id: "ryugu", name: "Ryugu", source: { kind: "local", path: "../../../ryugu" } },
        { id: "arcadia", name: "Zimproov - Arcadia", source: { kind: "local", path: "../../../../zimproov/arcadia" } },
        { id: "daguerre", name: "Omnium - Daguerre", source: { kind: "local", path: "../../../../omnium/daguerre" } },
    ],
    documentationOrigin: "https://docs.hypatia.local.whiteeclipse.dev",
    landingOrigin: "https://hypatia.local.whiteeclipse.dev",
} satisfies WebsiteConfiguration;
