/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { i18nextPlugin } from "@whiteeclipse/i18next/vite";

/** Bundles the client and build-time renderer, including the workspace package's source exports. */
export default defineConfig({
    root: fileURLToPath(new URL("../../../", import.meta.url)),
    plugins: [i18nextPlugin(), react()],
    resolve: { dedupe: ["react", "react-dom", "i18next", "react-i18next"] },
});
