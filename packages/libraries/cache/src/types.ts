/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Flat, Blob-based cache with implementation-defined retention and eviction.
 *
 * Keys are opaque identifiers, not filesystem paths. Each key identifies one
 * resource. Repository structure, parsing, and publication belong to consumers.
 * Entries may be evicted automatically; cache misses are expected.
 *
 * Returned Blobs are borrowed resources. Replacement, removal, eviction, or
 * disposal may invalidate them and any object URLs or streams derived from them.
 * Consumers must finish using them before those actions. Backends need not keep
 * an entire asset in memory, but Blob backing storage is implementation-specific.
 */
export interface CacheAdapter extends AsyncDisposable {
    /**
     * Retrieves a completed entry without requiring eager byte materialization.
     *
     * @param key Identifier of the cached resource.
     * @returns A borrowed Blob, or undefined for a cache miss.
     * @rejects If disposed or the entry cannot be accessed.
     */
    read(key: string): Promise<Blob | undefined>;

    /**
     * Stores a Blob and publishes the completed entry atomically.
     *
     * Partial writes are invisible and failed writes preserve the previous entry.
     * The caller keeps the supplied Blob valid until this operation settles.
     *
     * @param key Identifier under which to cache the resource.
     * @param contents Blob to store, including its MIME type.
     * @returns Completion after the complete entry is available to readers.
     * @rejects If disposed, the Blob is unreadable, or storage fails.
     */
    write(key: string, contents: Blob): Promise<void>;

    /**
     * Removes an entry, potentially invalidating previously returned Blobs.
     *
     * @param key Resource identifier. An absent entry is a no-op.
     * @returns Completion after subsequent reads will miss the removed entry.
     * @rejects If disposed or removal fails.
     */
    remove(key: string): Promise<void>;

    /**
     * Rejects new operations, waits for admitted operations, and releases resources.
     *
     * Repeated disposal is safe. Borrowed Blobs need not remain usable afterwards.
     * Implementations document whether stored entries survive disposal.
     *
     * @returns Completion after operations settle and resources are released.
     * @rejects For resource cleanup failures.
     */
    [Symbol.asyncDispose](): Promise<void>;
}
