/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchRepository, validateRepository } from "./git";
import { extractDocumentation, readSnapshotFile } from "./snapshot";
import { contentLimits } from "../content/files";
import type { LoadedRepository, RepositoryConfiguration } from "./types";

/** A complete candidate import, retained until its development session or build ends. */
export interface RepositoryImport {
    repositories: LoadedRepository[];
    /**
     * Deletes only this import's temporary source trees; cached Git objects remain reusable.
     *
     * @returns Completion after candidate staging is removed.
     * @rejects If temporary files cannot be removed.
     */
    dispose(): Promise<void>;
}

/**
 * Creates one isolated source tree and gives trusted generation code a bounded preparation stage.
 *
 * @param configuration - Explicit source and optional application-owned generator.
 * @param cache - Git object cache.
 * @param staging - This import's candidate directory.
 * @returns The prepared source and its immutable provenance.
 * @rejects If fetching, extraction, preparation, or its deadline fails.
 */
async function loadRepository(
    configuration: RepositoryConfiguration,
    cache: string,
    staging: string,
): Promise<LoadedRepository> {
    const { database, source } = await fetchRepository(configuration, cache);
    const docsRoot = resolve(staging, configuration.name, "docs");
    await extractDocumentation(database, source.commit, docsRoot);
    if (configuration.prepare !== undefined) {
        const signal = AbortSignal.timeout(contentLimits.milliseconds);
        const preparation = configuration.prepare({
            source,
            docsRoot,
            signal,
            /**
             * Reads a preparation input from the pinned snapshot.
             *
             * @param path - Explicit repository-relative file.
             * @returns Source bytes.
             * @rejects If the source is unsafe or unavailable, or the deadline has passed.
             */
            async readSource(path) {
                signal.throwIfAborted();
                return readSnapshotFile(database, source.commit, path);
            },
        });
        await Promise.race([
            preparation,
            new Promise<never>((_resolve, reject) => {
                signal.addEventListener(
                    "abort",
                    () => {
                        reject(new Error(`Preparation timed out: ${configuration.name}`));
                    },
                    { once: true },
                );
            }),
        ]);
        signal.throwIfAborted();
    }
    process.stdout.write(`Loaded ${configuration.name} at ${source.commit}.\n`);
    return { configuration, source, docsRoot };
}

/**
 * Fetches all configured public sources and runs explicitly registered application-owned preparation hooks.
 *
 * @param configurations - Complete source registry; names must be unique.
 * @param cache - Application cache directory.
 * @returns Prepared, commit-pinned documentation trees and their cleanup operation.
 * @rejects If any fetch, extraction, or preparation fails; incomplete candidates are removed.
 */
export async function loadRepositories(
    configurations: readonly RepositoryConfiguration[],
    cache: string,
): Promise<RepositoryImport> {
    const names = new Set<string>();
    for (const configuration of configurations) {
        validateRepository(configuration);
        if (names.has(configuration.name)) {
            throw new Error(`Duplicate repository name: ${configuration.name}`);
        }
        names.add(configuration.name);
    }
    await mkdir(cache, { recursive: true });
    const staging = await mkdtemp(resolve(cache, "sources-"));
    const repositories: LoadedRepository[] = [];
    try {
        for (const configuration of configurations) {
            repositories.push(await loadRepository(configuration, cache, staging));
        }
        return {
            repositories,
            /**
             * Releases this import's staging after rendering finishes.
             *
             * @returns Cleanup completion.
             * @rejects If removal fails.
             */
            dispose: async () => rm(staging, { recursive: true, force: true }),
        };
    } catch (error) {
        await rm(staging, { recursive: true, force: true });
        throw error;
    }
}
