/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { loadBuiltApp } from "./built-app";

const outputDirectory = fileURLToPath(new URL("../../dist/", import.meta.url));
const clientDirectory = resolve(outputDirectory, "client");
const app = await loadBuiltApp(outputDirectory);
app.use("/assets/*", serveStatic({ root: clientDirectory }));

const server = Bun.serve({
    hostname: process.env["HOST"] ?? "127.0.0.1",
    port: process.env["PORT"] ?? "4173",
    fetch: app.fetch,
});
process.stdout.write(`Landing SSR: ${server.url}\n`);
