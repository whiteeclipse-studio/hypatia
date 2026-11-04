/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { httpStatus } from "../shared/constants";
/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";


const root = fileURLToPath(new URL("../../dist/docs", import.meta.url));
const defaultPort = 20100;
const port = Number(process.env["PORT"] ?? defaultPort);
Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
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
        return new Response(Bun.file(resolve(root, "404.html")), {
            status: httpStatus.notFound,
            headers: { "Content-Type": "text/html" },
        });
    },
});
process.stdout.write(`Static preview: http://localhost:${port}\n`);
