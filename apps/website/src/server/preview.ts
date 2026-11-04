/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { httpStatus } from "../shared/constants";
/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { websiteModule } from "./website-module";


const defaultPort = 20100;
const port = Number(process.env["PORT"] ?? defaultPort);

/**
 * Resolves the static output for the incoming domain or local module override.
 *
 * @param request The static HTTP request.
 * @returns The module's generated output directory.
 */
function staticRoot(request: Request): string {
    const module = websiteModule(new URL(request.url).hostname) === "landing" ? "landing" : "docs";
    return fileURLToPath(new URL(`../../dist/${module}`, import.meta.url));
}

Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
        const root = staticRoot(request);
        let path: string;
        try {
            path = decodeURIComponent(new URL(request.url).pathname);
        } catch {
            return new Response("Invalid URL", { status: httpStatus.badRequest });
        }
        if (path.includes("\\") || path.includes("\0")) {
            return new Response("Invalid path", { status: httpStatus.badRequest });
        }
        const target = resolve(root, `.${path}`);
        if (target !== root && !target.startsWith(`${root}${sep}`)) {
            return new Response("Forbidden", { status: httpStatus.forbidden });
        }
        const file = Bun.file(path.endsWith("/") ? resolve(target, "index.html") : target);
        if (await file.exists()) {
            return new Response(file, { headers: { "X-Content-Type-Options": "nosniff" } });
        }
        const index = Bun.file(resolve(target, "index.html"));
        if (await index.exists()) {
            return Response.redirect(`${path}/`, httpStatus.moved);
        }
        if (/\.[a-z0-9]+$/i.test(path) || path.startsWith("/_")) {
            return new Response("Not found", { status: httpStatus.notFound });
        }
        const fallback = Bun.file(resolve(root, "404.html"));
        return new Response((await fallback.exists()) ? fallback : "Not found", {
            status: httpStatus.notFound,
            headers: { "Content-Type": "text/html" },
        });
    },
});
process.stdout.write(`Static preview: http://localhost:${port}\n`);
