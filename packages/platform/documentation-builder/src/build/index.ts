/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type { BuildOptions, BuildResult, SourceFile } from "../types.ts";
import { checkFileLimits, resolveLimits } from "../limits.ts";
import { requireCondition } from "../errors.ts";
import { runTask } from "../workers/task.ts";
import { discoverSources, requireWithin } from "./files.ts";
import { repositorySource } from "./provenance.ts";

/**
 * Builds docs through trusted transformations followed by bounded untrusted processing.
 *
 * @param options - Source repository, transformation, metadata, and resource configuration.
 * @returns A validated artifact with diagnostics and development-watch dependencies.
 * @rejects For filesystem, Git, plugin, metadata, security, or resource failures.
 */
export async function buildDocumentation(options: BuildOptions = {}): Promise<BuildResult> {
    const root = await realpath(resolve(options.repositoryRoot ?? "."));
    const limits = resolveLimits(options.limits);
    const source = await repositorySource(root, options);
    const discovered = await discoverSources(root, limits);
    const signal = AbortSignal.timeout(limits.timeoutMs);
    let files = discovered.files;
    for (const plugin of options.plugins ?? []) {
        signal.throwIfAborted();
        files = await plugin.transform(files, { source, signal });
        checkFileLimits(files.map(fileContent), limits);
        for (const file of plugin.watchFiles ?? []) {
            const path = resolve(root, file);
            requireWithin(root, await realpath(path));
            discovered.dependencies.push(path);
        }
    }
    checkFileLimits(files.map(fileContent), limits);
    const worker = new Worker(new URL("../workers/source.worker.ts", import.meta.url), { type: "module" });
    const result = await runTask(worker, {
        kind: "build",
        limits,
        input: { files, source, limits, licence: discovered.licence, generatedPages: options.generatedPages ?? {} },
    });
    requireCondition(result.kind === "artifact", "Unexpected build worker response");
    return { ...result.artifact, diagnostics: result.diagnostics, dependencies: discovered.dependencies };
}

/**
 * Selects content for resource accounting without copying source bytes.
 *
 * @param file - Virtual source file.
 * @returns Its bytes.
 */
function fileContent(file: SourceFile): Uint8Array {
    return file.content;
}
