/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { i18nextPlugin } from "@whiteeclipse/i18next/vite";
import { fileURLToPath } from "node:url";
import { configuration } from "./src/server/configuration.ts";


export default defineConfig({
    plugins: [tailwindcss(), i18nextPlugin({ root: import.meta.dirname })],
    resolve: {
        alias: {
            "node:assert": fileURLToPath(
                new URL("./node_modules/@jspm/core/nodelibs/browser/assert.js", import.meta.url),
            ),
        },
        conditions: ["development", "browser", "module"],
    },
    ssr: {
        noExternal: ["@whiteeclipse/i18next"],
        external: ["@whiteeclipse/docs-compiler"],
        resolve: { conditions: ["development", "module", "node"] },
    },
    worker: { format: "es" },
    oxc: {
        target: "es2022",
        // Linked workspace distributions also need syntax lowering during development.
        include: /\.[cm]?[jt]sx?$/,
        exclude: /node_modules/,
    },
    server: {
        allowedHosts: [
            new URL(configuration.documentationOrigin).hostname,
            new URL(configuration.landingOrigin).hostname,
            "hypatia.local.whiteeclipse.dev",
            "docs.hypatia.local.whiteeclipse.dev",
            "hypatia.mac.whiteeclipse.dev",
            "docs.hypatia.mac.whiteeclipse.dev",
        ],
    },
    build: { target: "es2022", manifest: true, outDir: "dist/docs", rolldownOptions: { input: "src/app/client.tsx" } },
});
