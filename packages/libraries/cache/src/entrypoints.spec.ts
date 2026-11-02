/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { build } from "vite";
import { expect, it } from "vitest";


/**
 * Bundles a synthetic consumer using browser package resolution.
 *
 * @param source Consumer module source.
 * @param conditions Additional resolution conditions to exercise.
 * @returns The in-memory Vite build output.
 * @rejects If an import cannot be resolved or bundled.
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
                 * Supplies the consumer without writing a fixture file.
                 *
                 * @param id Requested module identifier.
                 * @returns The virtual entry identifier when it matches.
                 */
                resolveId(id) {
                    if (id === entry) {
                        return entry;
                    }
                    return undefined;
                },
                /**
                 * Loads the synthetic consumer module.
                 *
                 * @param id Resolved module identifier.
                 * @returns The consumer source when requested.
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
