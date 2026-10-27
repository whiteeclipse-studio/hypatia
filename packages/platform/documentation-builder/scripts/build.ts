/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { build } from "bun";
import { rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { thirdPartyNotices } from "./notices.ts";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const outdir = fileURLToPath(new URL("../dist/", import.meta.url));
const bundledDependencies = new Set<string>();
await rm(outdir, { recursive: true, force: true });

/**
 * Bundles one runtime boundary without pulling Bun or filesystem code into browser entrypoints.
 *
 * @param entries - Entrypoints relative to src.
 * @param target - Supported Bun or browser runtime.
 * @param prefix - Distinct chunk namespace for independently bundled boundaries.
 * @returns Completion after distribution files have been written.
 * @rejects For bundler failures.
 */
async function bundle(entries: string[], target: "bun" | "browser", prefix: string): Promise<void> {
    const result = await build({
        root,
        outdir,
        target,
        entrypoints: entries.map(function entry(path): string {
            return `${root}${path}`;
        }),
        format: "esm",
        splitting: true,
        naming: { entry: "[dir]/[name].[ext]", chunk: `${prefix}-[hash].[ext]` },
        external: ["vite"],
        plugins: [
            {
                name: "dependency-notices",
                /**
                 * Records dependency modules without replacing their source or resolution.
                 *
                 * @param bundler - Bun plugin hook registration.
                 */
                setup(bundler): void {
                    bundler.onLoad({ filter: /node_modules/u }, function dependency(args): undefined {
                        bundledDependencies.add(args.path);
                        return undefined;
                    });
                },
            },
        ],
    });
    if (!result.success) {
        throw new AggregateError(result.logs, `Bun ${prefix} build failed`);
    }
    process.stdout.write(`${prefix}: ${result.outputs.length} distribution files\n`);
}

await bundle(["workers/source.worker.ts"], "bun", "source");
await bundle(["workers/artifact.worker.ts"], "browser", "worker");
await bundle(["index.ts", "cli.ts", "vite/index.ts"], "bun", "server");
await bundle(["artifact/index.ts", "browser/index.ts", "vite/client.ts"], "browser", "reader");
await writeFile(new URL("../dist/THIRD_PARTY_NOTICES", import.meta.url), await thirdPartyNotices(bundledDependencies));
