/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";


/** A versioned payload in the compiler cache, required for watch-mode content reuse. */
export interface ArtifactPayload {
    /** Immutable cache key. Plugins write the payload through context.cache before returning. */
    readonly key: string;
    /** Pure decoder independent of build resources and signals. Its input Blob is an independent copy. */
    decode(this: void, contents: Blob): Promisable<unknown>;
}

/**
 * Immutable data shared between snapshots.
 *
 * Includes nested metadata, but no storage or lifetime-bound resources.
 * Implementations enforce immutability beyond TypeScript's readonly properties.
 */
export interface ArtifactData {
    /** Logical path within the repository. */
    readonly path: string;
    /** Content type identifier. */
    readonly type: string;
    /** Immutable metadata. */
    readonly metadata: unknown;
}

/**
 * An artifact belonging to one snapshot.
 *
 * Snapshots share data and payloads, but create separate handles. Reads use the
 * owning snapshot's storage. Invalid handles throw ReferenceError on property
 * access and reject reads with ReferenceError.
 */
export interface Artifact extends ArtifactData {
    /** Payload descriptor for watch reuse. Unknown artifacts may omit it and have no contents. */
    readonly payload?: ArtifactPayload;

    /**
     * Reads this artifact's contents.
     *
     * Started reads may finish after invalidation; resources remain available
     * until they settle. Missing contents recover the same version or fail.
     * A read failure leaves the artifact in its repository.
     *
     * Results are independent copies: Blobs for assets, objects for parsed trees.
     * Borrowed cache content is consumed before returning. Changing a result does
     * not change the artifact, and disposal does not revoke returned values.
     *
     * @returns An independent copy of the contents.
     * @rejects If invalidated, the represented version is unavailable, or processing fails.
     */
    read(): Promise<unknown>;
}
