/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { loadBuiltApp } from "../built-app";
import { prerender } from "./prerender";

const argumentOffset = 2;
const args = process.argv.slice(argumentOffset).filter(argument => argument !== "--");
if (args.some(argument => argument !== "--static")) {
    throw new Error("Usage: bun src/server/scripts/build.ts [--static]");
}
const root = fileURLToPath(new URL("../../../", import.meta.url));
const configFile = resolve(root, "src/server/config/vite.config.ts");
const clientDirectory = resolve(root, "dist/client");

await build({ configFile, build: { outDir: clientDirectory } });
await build({
    configFile,
    build: {
        ssr: true,
        outDir: resolve(root, "dist/server"),
        copyPublicDir: false,
        rolldownOptions: {
            input: { app: resolve(root, "src/server/production.ts") },
        },
    },
});

const templatePath = resolve(root, "dist/server/index.html");
await copyFile(resolve(clientDirectory, "index.html"), templatePath);

if (args.includes("--static")) {
    await prerender(await loadBuiltApp(resolve(root, "dist")), clientDirectory);
}
