/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Blob cache with opaque keys.
 *
 * Retention and eviction depend on the adapter.
 *
 * Entries may be evicted. Returned Blobs, streams, and object URLs are borrowed:
 * finish using them before replacement, removal, eviction, or disposal.
 */
export interface CacheAdapter extends AsyncDisposable {
    /**
     * Reads an entry.
     *
     * @param key Resource identifier.
     * @returns A borrowed Blob, or undefined on a miss.
     * @rejects If disposed or access fails.
     */
    read(key: string): Promise<Blob | undefined>;

    /**
     * Writes an entry atomically.
     *
     * Failed writes preserve the old entry.
     *
     * @param key Resource identifier.
     * @param contents Blob and MIME type; keep valid until the write settles.
     * @returns Completion of the write; retention is not guaranteed.
     * @rejects If disposed, the Blob is unreadable, or storage fails.
     */
    write(key: string, contents: Blob): Promise<void>;

    /**
     * Removes an entry; absent keys are a no-op.
     *
     * @param key Resource identifier.
     * @returns Completion of removal.
     * @rejects If disposed or removal fails.
     */
    remove(key: string): Promise<void>;

    /**
     * Disposes the cache.
     *
     * Rejects new operations, drains pending ones, and releases resources.
     *
     * Stored entries may survive, depending on the adapter.
     *
     * @returns The cleanup outcome; repeated disposal is safe.
     * @rejects If cleanup fails.
     */
    [Symbol.asyncDispose](): Promise<void>;
}
