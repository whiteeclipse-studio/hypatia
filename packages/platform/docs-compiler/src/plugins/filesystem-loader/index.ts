/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompilerPlugin } from "../../types/index.js";
import {
    DEFAULT_FILESYSTEM_LOADER_CONFIGURATION,
    type FilesystemLoaderConfiguration,
    resolveConfiguration,
} from "./configuration.js";
import { createRepository, type FilesystemRepository } from "./repository/index.js";
import { resolveArtifact, resolveRepository } from "./repository/resolve.js";
import { transformRepository } from "./repository/discover.js";
import { loadArtifact } from "./load.js";
import { watchRepository } from "./repository/watch.js";
import { includeFilesystemTranslations, validateFilesystemTranslations } from "./translations.js";


export { DEFAULT_FILESYSTEM_LOADER_CONFIGURATION, type FilesystemLoaderConfiguration };

/**
 * Loads local repository directories as configurable raw assets with filesystem metadata.
 * Watching and incremental reuse are provided through compiler-owned services.
 *
 * @param configuration Working directory and replacement include/exclude file globs.
 * @returns A filesystem-only compiler plugin; does not parse Markdown or write outputs.
 * @throws {TypeError} If a file-selection pattern is invalid.
 */
export function filesystemLoader(configuration: FilesystemLoaderConfiguration = {}): CompilerPlugin {
    const options = resolveConfiguration(configuration);
    const repositories = new Map<string, FilesystemRepository>();
    const inventories = new Map<string, FilesystemRepository>();

    return {
        name: "filesystem-loader",
        buildStart() {
            for (const repository of repositories.values()) {
                repository.expectedTranslations.clear();
            }
        },
        async resolveId(input, importer) {
            if (importer === undefined) {
                const repository = await resolveRepository(input, options, repositories);
                if (repository === undefined) {
                    return undefined;
                }

                await this.watch(repository.reference, context => watchRepository(repository, options, context));
                return repository.reference;
            }

            let repositoryId: string;
            if (importer.type === "repository") {
                repositoryId = importer.id;
            } else {
                repositoryId = importer.id.repositoryId;
            }

            const repository = repositories.get(repositoryId);
            if (repository !== undefined) {
                return resolveArtifact(input, importer, repository, options);
            }

            return undefined;
        },
        async load(reference) {
            if (reference.type === "repository") {
                const repository = repositories.get(reference.id);
                if (repository !== undefined) {
                    const inventory = createRepository(repository, new Map());
                    inventories.set(inventory.id, repository);
                    return inventory;
                }

                return undefined;
            }

            const repository = repositories.get(reference.id.repositoryId);
            if (repository !== undefined) {
                return loadArtifact(reference, repository, this);
            }

            return undefined;
        },
        async transform(value, reference) {
            if (reference.type === "artifact") {
                const repository = repositories.get(reference.id.repositoryId);
                if (repository !== undefined && options.translations) {
                    await includeFilesystemTranslations(value, reference, { repository, configuration: options }, this);
                }
                return undefined;
            }
            if (!("getArtifact" in value)) {
                return undefined;
            }

            const repository = repositories.get(reference.id);
            if (repository !== undefined) {
                return transformRepository(repository, options, this);
            }

            return undefined;
        },
        buildEnd(repositories) {
            for (const repository of repositories) {
                const source = inventories.get(repository.id);
                if (source !== undefined) {
                    validateFilesystemTranslations(repository, source.expectedTranslations);
                }
            }
        },
    };
}
