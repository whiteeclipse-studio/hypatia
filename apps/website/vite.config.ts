/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { i18nextPlugin } from "@whiteeclipse/i18next/vite";
import { fileURLToPath } from "node:url";
import configuration from "./website.config";


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
    oxc: { target: "es2022" },
    server: {
        allowedHosts: [
            new URL(configuration.documentationOrigin).hostname,
            new URL(configuration.landingOrigin).hostname,
            "hypatia.local.whiteeclipse.dev",
        ],
    },
    build: { target: "es2022", manifest: true, outDir: "dist/docs", rolldownOptions: { input: "src/app/client.tsx" } },
});
