/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { pageContentSecurityPolicy } from "./scripts/output";
import { assetContentSecurityPolicy } from "./content/assets";
import { documentationBuildBase } from "./config/publication";

const outputDirectory = fileURLToPath(new URL("../../dist/", import.meta.url));
const clientDirectory = resolve(outputDirectory, "client");
const app = new Hono();
app.use("*", async (context, next) => {
    context.header(
        "Content-Security-Policy",
        context.req.path.endsWith(".svg") ? assetContentSecurityPolicy : pageContentSecurityPolicy,
    );
    context.header("X-Content-Type-Options", "nosniff");
    await next();
});
app.get("/", context => context.redirect(documentationBuildBase));
app.use(
    `${documentationBuildBase}*`,
    serveStatic({
        root: clientDirectory,
        /**
         * Maps the published docs mount to the application's standalone client directory.
         *
         * @param path - Incoming request path under the documentation mount.
         * @returns The path relative to the built application output.
         */
        rewriteRequestPath(path) {
            return path.slice(documentationBuildBase.length - 1);
        },
    }),
);

const server = Bun.serve({
    hostname: process.env["HOST"] ?? "127.0.0.1",
    port: process.env["PORT"] ?? "4174",
    fetch: app.fetch,
});
process.stdout.write(`Documentation SSG preview: ${server.url}\n`);
