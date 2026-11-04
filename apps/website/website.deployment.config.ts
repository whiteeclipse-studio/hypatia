/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { WebsiteConfiguration } from "./src/app/configuration";


/** Deploy local Hypatia sources and Ryugu's latest compiled documentation archive. */
export default {
    projects: [
        { id: "hypatia", name: "Hypatia", source: { kind: "local", path: "../.." } },
        {
            id: "ryugu",
            name: "Ryugu",
            archiveUrl: "https://hypatia-reverse-proxy.z8hm5znzhn.workers.dev/ryugu",
            source: {
                kind: "archive",
                url: "https://github.com/whiteeclipse-studio/ryugu/releases/latest/download/ryugu.tgz",
            },
        },
    ],
    documentationOrigin: "https://whiteeclipse.dev",
    landingOrigin: "https://whiteeclipse.fr",
} satisfies WebsiteConfiguration;
