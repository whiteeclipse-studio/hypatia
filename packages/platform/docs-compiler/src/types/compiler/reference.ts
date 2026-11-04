/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** A repository source identified by a plugin. */
export interface RepositoryReference {
    /** Source kind. */
    readonly type: "repository";
    /** Opaque source ID, interpreted by plugins. */
    readonly id: string;
    /** Optional source version; a different version prevents reuse. */
    readonly version?: string;
}

/** An artifact identifier scoped to a repository source. */
export interface ArtifactId {
    /** Logical path within the owning repository. */
    readonly path: string;
    /** Opaque ID of the owning repository source. */
    readonly repositoryId: string;
}

/** An artifact source identified by a plugin. */
export interface ArtifactReference {
    /** Source kind. */
    readonly type: "artifact";
    /** Repository-scoped source identifier. */
    readonly id: ArtifactId;
    /** Optional source version; a different version prevents reuse. */
    readonly version?: string;
}

/** A resolved repository or logical artifact identity, independent of authored document IDs. */
export type Reference = RepositoryReference | ArtifactReference;
