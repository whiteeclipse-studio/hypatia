/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "../types.ts";
import { createCacheOperationQueue } from "../operations.ts";
import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "cache", "memory"]);

/** Blob cache with least-recently-used eviction. */
export interface LruMemoryCacheAdapter extends CacheAdapter {
    /** Retained byte budget; empty Blobs count as one byte. */
    readonly maxBytes: number;
}

/**
 * Creates an LRU memory cache.
 *
 * Stores independent copies. Eviction and disposal leave caller-held Blobs usable.
 *
 * Zero disables retention. Oversized writes remove any previous entry.
 *
 * The budget excludes keys, object overhead, and temporary or caller-held copies.
 *
 * @param maxBytes Retained byte budget; empty Blobs count as one byte.
 * @returns The memory cache.
 * @throws {RangeError} If maxBytes is not a nonnegative safe integer.
 */
export function createLruMemoryCacheAdapter(maxBytes: number): LruMemoryCacheAdapter {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
        const error = new RangeError("maxBytes must be a nonnegative safe integer.");
        logger.error("Invalid memory cache byte budget.", { maxBytes, error });
        throw error;
    }
    logger.debug("Creating memory cache with a {maxBytes}-byte budget.", { maxBytes });
    const entries = new Map<string, Blob>();
    let usedBytes = 0;
    const queue = createCacheOperationQueue("memory", async () => {
        entries.clear();
        usedBytes = 0;
        await Promise.resolve();
    });

    /**
     * Removes an entry and frees its budget.
     *
     * @param key Resource identifier.
     */
    function removeEntry(key: string): void {
        const previous = entries.get(key);
        if (previous !== undefined) {
            usedBytes -= Math.max(previous.size, 1);
            entries.delete(key);
        }
    }

    return {
        maxBytes,
        async read(key) {
            return queue.run("read", key, () => {
                const blob = entries.get(key);
                if (blob !== undefined) {
                    // Move the entry to the end of the LRU list.
                    entries.delete(key);
                    entries.set(key, blob);
                }
                return blob;
            });
        },
        async write(key, contents) {
            return queue.run("write", key, async () => {
                const size = Math.max(contents.size, 1);
                if (size > maxBytes) {
                    removeEntry(key);
                    logger.debug("Skipped oversized cache entry.", { size, maxBytes });
                    return;
                }

                // Copy before changing the cache so read failures preserve old entries.
                const stored = new Blob([await contents.arrayBuffer()], { type: contents.type });
                removeEntry(key);
                entries.set(key, stored);
                usedBytes += size;
                while (usedBytes > maxBytes) {
                    const oldest = entries.keys().next();
                    if (oldest.done === true) {
                        break;
                    }
                    removeEntry(oldest.value);
                    logger.debug("Evicted least recently used cache entry.", { usedBytes, maxBytes });
                }
            });
        },
        async remove(key) {
            await queue.run("remove", key, () => {
                removeEntry(key);
            });
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}
