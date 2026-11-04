/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { glob, realpath } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import type { AnyArtifact, Repository, TransformHookContext } from "../../../types/index.js";
import { toLogicalPath } from "../../../paths.js";
import type { ResolvedFilesystemLoaderConfiguration } from "../configuration.js";
import { createRepository, type FilesystemRepository, isWithin } from "./index.js";


/**
 * Assembles a repository from discovered child requests using compiler-owned incremental reuse.
 *
 * @param repository Canonical filesystem source and its latest discovered file identities.
 * @param configuration Included and excluded file globs.
 * @param context Build services and importer-aware child loading.
 * @returns The completed repository inventory.
 * @rejects If discovery, child processing, or artifact-path validation fails.
 */
export async function transformRepository(
    repository: FilesystemRepository,
    configuration: ResolvedFilesystemLoaderConfiguration,
    context: TransformHookContext,
): Promise<Repository> {
    const files = await discoverFiles(repository, configuration, context.signal);

    const discovered = new Set(files.values());
    // Keep explicitly linked sources in watcher bookkeeping even when globs do not discover them.
    for (const file of discovered) {
        if (!repository.files.has(file)) {
            repository.files.set(file, undefined);
        }
    }

    const artifacts = new Map<string, AnyArtifact>();
    for (const file of files.values()) {
        const artifact = await context.load(pathToFileURL(file));
        if (!("read" in artifact) || artifacts.has(artifact.path)) {
            throw new TypeError(`Expected a child artifact with a unique logical path for ${file}.`);
        }

        artifacts.set(artifact.path, artifact);
    }

    return createRepository(repository, artifacts);
}

/**
 * Discovers regular selected files and rejects logical-path collisions.
 *
 * @param repository Canonical filesystem source.
 * @param configuration Included and excluded file globs.
 * @param signal Build cancellation.
 * @returns Absolute file paths indexed by normalized logical paths.
 * @rejects If discovery fails or distinct files normalize to the same logical path.
 */
async function discoverFiles(
    repository: FilesystemRepository,
    configuration: ResolvedFilesystemLoaderConfiguration,
    signal: AbortSignal,
): Promise<ReadonlyMap<string, string>> {
    const files = new Map<string, string>();
    const entries = glob(configuration.include, {
        cwd: repository.directory,
        exclude: configuration.translations
            ? [...configuration.exclude, "docs/translations/**"]
            : [...configuration.exclude],
        withFileTypes: true,
    });

    for await (const entry of entries) {
        signal.throwIfAborted();
        if (!entry.isFile()) {
            continue;
        }

        const file = resolve(entry.parentPath, entry.name);
        if (!isWithin(repository.directory, file) || (await realpath(file)) !== file) {
            continue;
        }

        const path = toLogicalPath(relative(repository.directory, file).split(sep).join("/"));
        const existing = files.get(path);
        if (existing !== undefined && existing !== file) {
            throw new Error(`Filesystem sources collide at logical path ${path}.`);
        }

        files.set(path, file);
    }

    return files;
}
