/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { i18nextPlugin } from "@whiteeclipse/i18next/vite";
import { documentationBuildBase } from "./publication.ts";

/** Bundles the client and build-time renderer using workspace source exports. */
export default defineConfig(({ command, isPreview }) => {
    return {
        base: command === "build" || isPreview === true ? documentationBuildBase : "/",
        appType: "mpa",
        root: fileURLToPath(new URL("../../../", import.meta.url)),
        plugins: [i18nextPlugin(), react()],
        resolve: { dedupe: ["react", "react-dom", "i18next", "react-i18next"] },
    };
});
