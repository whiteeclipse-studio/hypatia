/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { build } from "vite";
import { expect, it } from "vitest";


/**
 * Bundles a browser consumer in memory.
 *
 * @param source Consumer source.
 * @param conditions Additional resolution conditions.
 * @returns The Vite build output.
 * @rejects If resolution or bundling fails.
 */
async function bundleBrowser(source: string, conditions: string[] = []) {
    const entry = resolve(import.meta.dirname, "cache-browser-consumer.ts");
    return build({
        configFile: false,
        root: import.meta.dirname,
        logLevel: "silent",
        resolve: { conditions: ["browser", "module", ...conditions] },
        plugins: [
            {
                name: "cache-browser-consumer",
                /**
                 * Resolves the virtual consumer entry.
                 *
                 * @param id Module identifier.
                 * @returns The entry identifier if matched.
                 */
                resolveId(id) {
                    if (id === entry) {
                        return entry;
                    }
                    return undefined;
                },
                /**
                 * Loads the virtual consumer.
                 *
                 * @param id Module identifier.
                 * @returns The consumer source if matched.
                 */
                load(id) {
                    if (id === entry) {
                        return source;
                    }
                    return undefined;
                },
            },
        ],
        build: {
            write: false,
            minify: false,
            lib: { entry, formats: ["es"] },
        },
    });
}

it("bundles the root and portable adapters for browsers without server dependencies", async () => {
    const result = await bundleBrowser(`
        export { encodeJson, decodeJson } from "@whiteeclipse/cache";
        export { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";
        export { createIndexedDbCacheAdapter } from "@whiteeclipse/cache/indexeddb";
        export { createAggregateCacheAdapter } from "@whiteeclipse/cache/aggregate";
    `);
    if ("on" in result) {
        throw new Error("Expected a non-watching build.");
    }
    const outputs = Array.isArray(result) ? result : [result];
    const chunks = outputs.flatMap(output => output.output).filter(output => output.type === "chunk");
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
        expect(chunk.code).not.toMatch(/node:|__vite-browser-external|mkdtempDisposable|openAsBlob/);
    }
});

it.each([{ conditions: [] }, { conditions: ["development"] }])(
    "rejects the filesystem subpath under browser resolution with extra conditions %j",
    async ({ conditions }) => {
        await expect(
            bundleBrowser('export { createFileSystemCacheAdapter } from "@whiteeclipse/cache/filesystem";', conditions),
        ).rejects.toThrow();
    },
);

it("blocks filesystem imports when Node enables both browser and node conditions", () => {
    const stdout = execFileSync(
        process.execPath,
        [
            "--conditions=browser",
            "--input-type=module",
            "--eval",
            `try {
            await import("@whiteeclipse/cache/filesystem");
            process.exitCode = 1;
        } catch (error) {
            if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error;
            console.log(error.code);
        }`,
        ],
        { cwd: import.meta.dirname, encoding: "utf8" },
    );
    expect(stdout.trim()).toBe("ERR_PACKAGE_PATH_NOT_EXPORTED");
});
