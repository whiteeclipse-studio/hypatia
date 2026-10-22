/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { copyFile, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { loadBuiltApp } from "../built-app";
import { compilePublication, createSite, documentationCache } from "../content/site";
import { loadCatalogue } from "../content/catalogue";
import { loadRepositories, type RepositoryImport } from "../repositories/load";
import { repositories } from "../repositories/configuration";
import { writeManifest } from "./output";
import { prerender } from "./prerender";
import { publishAssets } from "./assets";
import { documentationBuildBase } from "../config/publication";

const argumentOffset = 2;
if (process.argv.slice(argumentOffset).some(argument => argument !== "--" && argument !== "--static")) {
    throw new Error("Usage: bun src/server/scripts/build.ts [--static]; all builds prerender every page.");
}
const root = fileURLToPath(new URL("../../../", import.meta.url));
const cache = resolve(root, ".cache");
await mkdir(cache, { recursive: true });
const staging = await mkdtemp(resolve(cache, "documentation-build-"));
const client = resolve(staging, "client");
const server = resolve(staging, "server");
const configFile = resolve(root, "src/server/config/vite.config.ts");
let sources: RepositoryImport | undefined;

try {
    sources = await loadRepositories(repositories, documentationCache);
    const catalogues = [];
    for (const repository of sources.repositories) {
        catalogues.push(
            await loadCatalogue(
                repository.docsRoot,
                repository.configuration.name,
                repository.configuration.title,
                documentationBuildBase,
            ),
        );
    }
    const publication = await compilePublication(createSite(catalogues));
    await build({ configFile, build: { outDir: client } });
    await build({
        configFile,
        build: {
            ssr: true,
            outDir: server,
            copyPublicDir: false,
            rolldownOptions: { input: { app: resolve(root, "src/server/production.ts") } },
        },
    });
    await copyFile(resolve(client, "index.html"), resolve(server, "index.html"));
    await writeFile(resolve(server, "publication.json"), JSON.stringify(publication));
    const routes = [publication.base, ...publication.documents.map(document => document.route)];
    await prerender(await loadBuiltApp(staging), client, routes, publication.base);
    const assetCount = await publishAssets(catalogues, client);
    await writeManifest(
        client,
        sources.repositories.map(repository => repository.source),
    );

    const destination = resolve(root, "dist");
    const previous = resolve(cache, `documentation-previous-${crypto.randomUUID()}`);
    let hadPrevious = false;
    try {
        await rename(destination, previous);
        hadPrevious = true;
    } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
            throw error;
        }
    }
    try {
        await rename(staging, destination);
    } catch (error) {
        if (hadPrevious) {
            await rename(previous, destination);
        }
        throw error;
    }
    if (hadPrevious) {
        await rm(previous, { recursive: true, force: true });
    }
    process.stdout.write(`Prerendered ${routes.length} pages and ${assetCount} supporting assets.\n`);
} finally {
    await sources?.dispose();
    await rm(staging, { recursive: true, force: true });
}
