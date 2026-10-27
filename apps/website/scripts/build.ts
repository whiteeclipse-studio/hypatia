/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { mkdir, mkdtemp, rename, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

/**
 * Runs the generated server bundle in Bun with the same artifact-only Vite snapshot.
 *
 * @param entry - Generated server bundle.
 * @param output - Staged client output.
 * @returns Completion after prerendering all pages.
 * @rejects For module loading or prerender failures.
 */
async function runPrerender(entry: string, output: string): Promise<void> {
    const module: unknown = await import(pathToFileURL(entry).href);
    if (!isPrerenderModule(module)) {
        throw new Error("The server bundle does not export its prerender function.");
    }
    await module.prerender(output);
}
const root = fileURLToPath(new URL("..", import.meta.url));

/** Runtime contract of the generated Vite server bundle. */
interface PrerenderModule {
    /**
     * Writes static pages and validates their deployment inventory.
     *
     * @param output - Staged client output.
     * @returns Completion after all files are generated.
     * @rejects For rendering, inventory, or filesystem failures.
     */
    prerender(output: string): Promise<void>;
}

/**
 * Checks the generated module's public entrypoint before calling it.
 *
 * @param value - Dynamically loaded server module.
 * @returns Whether it exposes the expected generation entrypoint.
 */
function isPrerenderModule(value: unknown): value is PrerenderModule {
    return typeof value === "object" && value !== null && "prerender" in value && typeof value.prerender === "function";
}

/**
 * Replaces the completed documentation output, restoring the previous build if installation fails.
 *
 * @param staged - Fully generated output directory.
 * @param temporary - Owned staging directory for the previous output.
 * @returns Completion after installing the new build.
 * @rejects For filesystem failures; a replaced prior output is restored when possible.
 */
async function installOutput(staged: string, temporary: string): Promise<void> {
    const target = resolve(root, "dist/docs");
    const previous = resolve(temporary, "previous");
    const exists = await stat(target).then(
        function found(): boolean {
            return true;
        },
        function missing(error: unknown): boolean {
            if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                return false;
            }
            throw error;
        },
    );
    if (exists) {
        await rename(target, previous);
    }
    try {
        await rename(staged, target);
    } catch (error) {
        if (exists) {
            await rename(previous, target);
        }
        throw error;
    }
}

/**
 * Builds client and server bundles from prebuilt artifacts, then generates complete static pages.
 *
 * @returns Completion after a successful staged build replaces the previous documentation output.
 * @rejects For type-independent bundle, artifact, prerender, inventory, or filesystem failures.
 */
async function main(): Promise<void> {
    await mkdir(resolve(root, "dist"), { recursive: true });
    const temporary = await mkdtemp(resolve(root, "dist/.website-"));
    const client = resolve(temporary, "docs");
    const server = resolve(temporary, "server");
    try {
        await build({ root, build: { outDir: client } });
        await build({ root, publicDir: false, build: { ssr: resolve(root, "scripts/prerender.tsx"), outDir: server } });
        await runPrerender(resolve(server, "prerender.js"), client);
        await installOutput(client, temporary);
    } finally {
        await rm(temporary, { recursive: true, force: true });
    }
}

main().catch(function failure(error: unknown): void {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
});
