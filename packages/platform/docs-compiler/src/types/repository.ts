/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { AnyArtifact } from "./artifact";


/**
 * An immutable collection of artifacts belonging to one snapshot.
 *
 * Entries have unique keys matching artifact paths; iteration order is unspecified.
 * Repository transforms determine the final inventory.
 * Loading dependencies or losing cached content does not change it.
 *
 * Properties, lookups, and iterator steps throw ReferenceError after snapshot invalidation.
 * The snapshot disposes resources for the repository and artifacts.
 */
export interface Repository extends Iterable<readonly [string, AnyArtifact]> {
    /** Stable identifier independent of the source location. */
    readonly id: string;
    /** Display name. */
    readonly name: string;
    /** Immutable metadata, including nested values. */
    readonly metadata: unknown;

    /**
     * Looks up an artifact without loading its contents.
     *
     * @param path Logical path within this repository.
     * @returns The artifact, or undefined when the path is absent.
     * @throws {ReferenceError} If the snapshot is invalid.
     */
    getArtifact(path: string): AnyArtifact | undefined;
}
