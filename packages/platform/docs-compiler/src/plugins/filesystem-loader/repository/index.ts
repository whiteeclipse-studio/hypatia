/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { basename, isAbsolute, matchesGlob, relative, sep } from "node:path";
import type { AnyArtifact, ArtifactReference, Repository, RepositoryReference } from "../../../types/index.js";
import { toLogicalPath } from "../../../paths.js";
import type { ResolvedFilesystemLoaderConfiguration } from "../configuration.js";


/** Source identity and discovery bookkeeping; holds no content or private cache. */
export interface FilesystemRepository {
    /** Canonical absolute directory used as the opaque repository source ID. */
    readonly directory: string;
    /** Stable source identity used by resolution and subscription notifications. */
    readonly reference: RepositoryReference;
    /** Discovered files and their last resolved stat versions, used to filter coarse watch events. */
    readonly files: Map<string, string | undefined>;
    /** Physical source paths indexed by normalized logical artifact path. */
    readonly sources: Map<string, string>;
    /** Physical translation directories whose catalogue changes invalidate discovery results. */
    readonly translationDirectories: Set<string>;
    /** Current build's discovered translation paths and expected canonical document IDs. */
    readonly expectedTranslations: Map<string, string>;
}

/**
 * Checks whether a filesystem path stays within its repository.
 *
 * @param directory Canonical repository root.
 * @param file Absolute candidate path.
 * @returns Whether the candidate is the root or one of its descendants.
 */
export function isWithin(directory: string, file: string): boolean {
    const path = relative(directory, file);
    return !isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`);
}

/**
 * Tests exclusions for files and whole directory subtrees.
 *
 * @param path Repository-relative path using forward slashes.
 * @param configuration Resolved selection rules.
 * @returns Whether the path is excluded.
 */
export function isExcluded(path: string, configuration: ResolvedFilesystemLoaderConfiguration): boolean {
    return configuration.exclude.some(pattern => matchesGlob(path, pattern) || matchesGlob(`${path}/`, pattern));
}

/**
 * Tests whether a repository-relative file is selected by the configured globs.
 *
 * @param path Repository-relative path using forward slashes.
 * @param configuration Resolved selection rules.
 * @returns Whether the file should be loaded as an asset.
 */
export function isSelected(path: string, configuration: ResolvedFilesystemLoaderConfiguration): boolean {
    return !isExcluded(path, configuration) && configuration.include.some(pattern => matchesGlob(path, pattern));
}

/**
 * Creates a repository-scoped file identity, independently of its logical artifact path.
 *
 * @param repository Owning filesystem repository.
 * @param file Absolute source path.
 * @returns An artifact reference without a source version.
 */
export function fileReference(repository: FilesystemRepository, file: string): ArtifactReference {
    const path = toLogicalPath(relative(repository.directory, file).split(sep).join("/"));
    return {
        type: "artifact",
        id: { repositoryId: repository.directory, path },
    };
}

/**
 * Creates a fixed repository representation with identity derived from its directory.
 *
 * @param repository Owning filesystem repository.
 * @param artifacts Completed child artifacts indexed by logical path.
 * @returns A frozen repository whose final inventory is selected by its transform.
 * @throws {Error} If the directory basename cannot form a logical repository ID.
 */
export function createRepository(
    repository: FilesystemRepository,
    artifacts: ReadonlyMap<string, AnyArtifact>,
): Repository {
    const name = basename(repository.directory);
    return Object.freeze({
        id: toLogicalPath(name),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        metadata: Object.freeze({}),
        getArtifact: (path: string) => artifacts.get(path),
        [Symbol.iterator]: () => artifacts.entries(),
    });
}
