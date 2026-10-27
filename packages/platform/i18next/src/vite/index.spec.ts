/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { mkdtemp, mkdir, writeFile, rm, symlink, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, createServer, type ViteDevServer } from "vite";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { i18nextPlugin } from "./index.ts";

let directory: string;
let server: ViteDevServer | undefined;

beforeEach(async () => {
    directory = await realpath(await mkdtemp(join(tmpdir(), "hypatia-vite-")));
    await mkdir(join(directory, "locales/fr"), { recursive: true });
    await mkdir(join(directory, "locales/ja"), { recursive: true });
    await mkdir(join(directory, "node_modules/@whiteeclipse"), { recursive: true });
    await symlink(resolve(import.meta.dirname, "../.."), join(directory, "node_modules/@whiteeclipse/i18next"));
    await writeFile(join(directory, "locales/fr/common.yaml"), "title: Bonjour\n");
    await writeFile(join(directory, "locales/ja/common.yaml"), "title: こんにちは\n");
    await writeFile(
        join(directory, "entry.js"),
        'import catalogue from "virtual:whiteeclipse-locales"; export { catalogue }; export const frozen = Object.isFrozen(catalogue.fr.common);',
    );
});

afterEach(async () => {
    await server?.close();
    server = undefined;
    await rm(directory, { recursive: true, force: true });
});

it.each([false, true])("bundles all locales for a real Vite build with ssr=%s", async ssr => {
    const result = await build({
        root: directory,
        configFile: false,
        logLevel: "silent",
        plugins: [i18nextPlugin()],
        build: { write: false, minify: false, ssr, lib: { entry: join(directory, "entry.js"), formats: ["es"] } },
    });

    const outputs = Array.isArray(result) ? result : [result];
    const code = outputs
        .flatMap(output =>
            "output" in output ? output.output.filter(chunk => chunk.type === "chunk").map(chunk => chunk.code) : [],
        )
        .join("\n");
    expect(code).toContain("Bonjour");
    expect(code).toContain("こんにちは");
    expect(code).not.toContain("react.production");
    expect(code).not.toContain("node:fs");
});

it("fails a real build for namespace collisions even without a virtual-module import", async () => {
    await writeFile(join(directory, "locales/fr/blog.article.yaml"), "title: One\n");
    await mkdir(join(directory, "locales/fr/blog"));
    await writeFile(join(directory, "locales/fr/blog/article.yaml"), "title: Two\n");
    await writeFile(join(directory, "entry.js"), "export const unrelated = true;");

    await expect(
        build({
            root: directory,
            configFile: false,
            logLevel: "silent",
            plugins: [i18nextPlugin()],
            build: { write: false, lib: { entry: join(directory, "entry.js"), formats: ["es"] } },
        }),
    ).rejects.toThrow("Duplicate translation namespace");
});

it("provides immutable catalogues to independent server/static renders from a custom application root", async () => {
    server = await createServer({
        root: join(directory, "other"),
        configFile: false,
        logLevel: "silent",
        plugins: [i18nextPlugin({ root: directory })],
        server: { middlewareMode: true, hmr: false },
    });
    const module: unknown = await server.ssrLoadModule(join(directory, "entry.js"));

    expect(module).toMatchObject({
        frozen: true,
        catalogue: { fr: { common: { title: "Bonjour" } }, ja: { common: { title: "こんにちは" } } },
    });
});

it.each(["add", "change", "unlink"])("refreshes browser and server modules for a YAML %s event", async event => {
    server = await createServer({
        root: directory,
        configFile: false,
        logLevel: "silent",
        plugins: [i18nextPlugin()],
        server: { middlewareMode: true, hmr: false },
    });
    await server.transformRequest("virtual:whiteeclipse-locales");
    await server.ssrLoadModule("virtual:whiteeclipse-locales");
    const client = server.environments.client;
    const clientInvalidation = vi.spyOn(client.moduleGraph, "invalidateModule");
    const reload = vi.spyOn(client.hot, "send");
    const file = join(directory, event === "add" ? "locales/fr/extra.yaml" : "locales/fr/common.yaml");

    if (event === "unlink") {
        await rm(file);
    } else {
        await writeFile(file, "title: Updated\n");
    }
    server.watcher.emit(event, file);

    expect(clientInvalidation).toHaveBeenCalled();
    expect(reload).toHaveBeenCalledWith({ type: "full-reload" });
    const updated: unknown = await server.ssrLoadModule("virtual:whiteeclipse-locales");
    if (event === "unlink") {
        expect(updated).toMatchObject({ catalogue: { ja: { common: { title: "こんにちは" } } } });
        expect(updated).not.toHaveProperty("catalogue.fr");
    } else {
        expect(updated).toHaveProperty(
            event === "add" ? "catalogue.fr.extra.title" : "catalogue.fr.common.title",
            "Updated",
        );
    }
});

it("ignores unrelated files and removes its listeners when Vite closes", async () => {
    server = await createServer({
        root: directory,
        configFile: false,
        logLevel: "silent",
        plugins: [i18nextPlugin()],
        server: { middlewareMode: true, hmr: false },
    });
    const watcher = server.watcher;
    const reload = vi.spyOn(server.environments.client.hot, "send");
    watcher.emit("change", join(directory, "outside.yaml"));
    watcher.emit("change", join(directory, "locales/fr/notes.txt"));
    expect(reload).not.toHaveBeenCalled();

    await server.close();
    watcher.emit("change", join(directory, "locales/fr/common.yaml"));
    expect(reload).not.toHaveBeenCalled();
    server = undefined;
});

it("detects the first locale added to an initially absent directory without restarting Vite", async () => {
    await rm(join(directory, "locales"), { recursive: true });
    server = await createServer({
        root: directory,
        configFile: false,
        logLevel: "silent",
        plugins: [i18nextPlugin()],
        server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 20 } },
    });
    await server.transformRequest("virtual:whiteeclipse-locales");
    await vi.waitFor(() => {
        expect(Object.keys(server?.watcher.getWatched() ?? {})).toContain(directory);
    });
    const reload = vi.spyOn(server.environments.client.hot, "send");

    await mkdir(join(directory, "locales/fr"), { recursive: true });
    await writeFile(join(directory, "locales/fr/common.yaml"), "title: First\n");
    await vi.waitFor(() => {
        expect(reload).toHaveBeenCalledWith({ type: "full-reload" });
    });

    const module: unknown = await server.ssrLoadModule("virtual:whiteeclipse-locales");
    expect(module).toMatchObject({ catalogue: { fr: { common: { title: "First" } } } });
});
