/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import { z } from "zod";
import { configuration } from "../server/configuration";
import { createSources } from "../server/sources";
import { type Bootstrap, pageDataUrl } from "../modules/documentation/domain/types";
import { renderingModuleSchema } from "../rendering/module";
import { documentationHome } from "../modules/documentation/domain/routes";


const root = fileURLToPath(new URL("../..", import.meta.url));
await using sources = await createSources(configuration, false, root);
await build({ root });
await build({
    root,
    build: {
        ssr: "src/rendering/server.tsx",
        outDir: ".cache/ssg",
        manifest: false,
        rolldownOptions: { input: "src/rendering/server.tsx" },
    },
});
const loaded: unknown = await import(pathToFileURL(resolve(root, ".cache/ssg/server.js")).href);
const rendering = renderingModuleSchema.parse(loaded);
const manifest = z
    .record(
        z.string(),
        z.object({ file: z.string(), css: z.array(z.string()).optional(), isEntry: z.boolean().optional() }),
    )
    .parse(JSON.parse(await readFile(resolve(root, "dist/docs/.vite/manifest.json"), "utf8")));
const entry = Object.values(manifest).find(item => item.isEntry === true);
if (entry === undefined) {
    throw new Error("Client entry is missing from Vite manifest.");
}
const css = (entry.css ?? []).map(file => `<link rel="stylesheet" href="/${file}">`).join("");
const assets = `${css}<script type="module" src="/${entry.file}"></script>`;
/**
 * Writes a generated asset within the static output directory.
 *
 * @param path The path value.
 * @param contents The contents value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 * @throws {Error} If the supplied input or current state is invalid.
 */
async function output(path: string, contents: string | Blob): Promise<void> {
    const target = resolve(root, "dist/docs", `.${path}`);
    if (!target.startsWith(`${resolve(root, "dist/docs")}/`)) {
        throw new Error("Output path escapes the static site.");
    }
    await mkdir(dirname(target), { recursive: true });
    if (typeof contents === "string") {
        await writeFile(target, contents);
    } else {
        await writeFile(target, new Uint8Array(await contents.arrayBuffer()));
    }
}
const indexes = sources.indexes();
await output("/_data/catalogue.json", JSON.stringify(indexes));
const routes = ["/"];
/**
 * Generates the initial HTML for one documentation route.
 *
 * @param route The route value.
 * @param bootstrap The bootstrap value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function page(route: string, bootstrap: Bootstrap): Promise<void> {
    const payload: Bootstrap = { ...bootstrap, landingOrigin: configuration.landingOrigin };
    const body = await rendering.render(payload, route);
    await output(
        `${route}index.html`,
        rendering.htmlDocument(payload, body, { assets, route, origin: configuration.documentationOrigin }),
    );
}
await output(
    "/index.html",
    rendering.htmlDocument(
        { module: "documentation", locale: "en", indexes: [], development: false },
        `<main><a href="${documentationHome}">Open Hypatia documentation</a></main>`,
        {
            assets: `<meta http-equiv="refresh" content="0;url=${documentationHome}">`,
            route: documentationHome,
            origin: configuration.documentationOrigin,
        },
    ),
);
for (const index of indexes) {
    const project = sources.get(index.project.id);
    if (project === undefined) {
        throw new Error("Project vanished during generation.");
    }
    for (const data of Object.values(project.pages)) {
        await output(pageDataUrl(index, data.route), JSON.stringify(data));
        await page(data.route, { module: "documentation", locale: "en", indexes, page: data, development: false });
        routes.push(data.route);
    }
    for (const [path, blob] of Object.entries(project.assets)) {
        await output(index.assets[path] ?? "", blob);
    }
}
const fallback: Bootstrap = {
    module: "documentation",
    locale: "en",
    indexes: [],
    development: false,
    landingOrigin: configuration.landingOrigin,
};
await output(
    "/404.html",
    rendering.htmlDocument(fallback, "", {
        assets,
        route: "/",
        origin: configuration.documentationOrigin,
        fallback: true,
    }),
);
await output("/routes.json", JSON.stringify(routes));
await output(
    "/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${rendering.escapeHtml(new URL(route, configuration.documentationOrigin).href)}</loc></url>`).join("")}</urlset>`,
);
const landing: Bootstrap = {
    module: "landing",
    locale: "en",
    indexes: [],
    development: false,
    documentationOrigin: configuration.documentationOrigin,
};
await rm(resolve(root, "dist/landing"), { recursive: true, force: true });
await mkdir(resolve(root, "dist/landing"), { recursive: true });
await cp(resolve(root, "public/favicon"), resolve(root, "dist/landing/favicon"), { recursive: true });
await cp(resolve(root, "dist/docs/assets"), resolve(root, "dist/landing/assets"), { recursive: true });
await writeFile(
    resolve(root, "dist/landing/index.html"),
    rendering.htmlDocument(landing, await rendering.render(landing, "/"), {
        assets,
        route: "/",
        origin: configuration.landingOrigin,
    }),
);
await writeFile(resolve(root, "dist/landing/routes.json"), JSON.stringify(["/"]));
await writeFile(
    resolve(root, "dist/landing/sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${rendering.escapeHtml(new URL("/", configuration.landingOrigin).href)}</loc></url></urlset>`,
);
process.stdout.write(
    `Generated ${routes.length} documentation routes. Deploy dist/docs and dist/landing as static roots.\n`,
);
