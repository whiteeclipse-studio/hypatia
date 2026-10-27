/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { documentationPlugin } from "@whiteeclipse/documentation-builder/vite";
import { sources } from "./documentation.sources.ts";

export default defineConfig({
    plugins: [tailwindcss(), documentationPlugin({ sources })],
    build: { outDir: "dist/docs" },
    ssr: { external: ["@whiteeclipse/documentation-builder/artifact"] },
    server: {
        port: 20100,
        strictPort: true,
        watch: { ignored: ["**/dist/**", "**/artifacts/**"] },
        allowedHosts: [
            "hypatia.local.whiteeclipse.dev",
            "hypatia.mac.whiteeclipse.dev",
            "hypatia.cok.whiteeclipse.dev",
        ],
    },
    preview: { port: 20100, strictPort: true },
});
