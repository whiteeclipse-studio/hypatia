/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "../types.ts";
import { createCacheOperationQueue } from "../operations.ts";
import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "cache", "aggregate"]);

/**
 * Reads adapters in order and replicates writes and removals to all adapters.
 *
 * Reads stop at the first hit and propagate errors rather than treating them as misses.
 * Replicated operations attempt every adapter and reject with an AggregateError after all settle.
 * Replication is not transactional:
 * successful backends are not rolled back when another fails, so their contents may differ.
 *
 * Operations run sequentially in invocation order;
 * backends within a replicated operation run concurrently.
 * Disposal stops admission, drains operations, and disposes every distinct child once,
 * reporting all cleanup failures together.
 * The aggregate owns its children; do not dispose or mutate them independently.
 */
export interface AggregateCacheAdapter<T extends readonly CacheAdapter[]> extends CacheAdapter {
    /** The adapters in read-priority order. Do not mutate this list while in use. */
    readonly adapters: T;
}

/**
 * Creates an aggregate owning the supplied adapters, including their disposal.
 *
 * An empty aggregate always misses; writes, removals, and disposal are no-ops.
 *
 * @param adapters Adapters in read-priority order, whose membership stays fixed.
 * @returns A Blob-based aggregate cache.
 * @rejects Returned operations reject on disposal or backend failures, as described by the interface.
 */
export function createAggregateCacheAdapter<T extends readonly CacheAdapter[]>(adapters: T): AggregateCacheAdapter<T> {
    logger.debug("Creating aggregate cache with {childCount} children.", { childCount: adapters.length });
    const queue = createCacheOperationQueue("aggregate", async () =>
        replicate(async adapter => adapter[Symbol.asyncDispose](), "Aggregate cache disposal failed."),
    );

    /**
     * Attempts every child even if an invocation throws synchronously.
     *
     * @param action Operation to invoke on each child.
     * @param message Description used if one or more children fail.
     * @returns Completion after every child settles.
     * @rejects With all failures in adapter order.
     */
    async function replicate(action: (adapter: CacheAdapter) => Promise<void>, message: string): Promise<void> {
        const results = await Promise.allSettled([...new Set(adapters)].map(async adapter => action(adapter)));
        const errors: unknown[] = [];
        for (const result of results) {
            if (result.status === "rejected") {
                errors.push(result.reason);
            }
        }
        if (errors.length > 0 && errors.length < results.length) {
            logger.warn("Aggregate cache operation partially succeeded.", {
                operation: message,
                failed: errors.length,
                total: results.length,
            });
        }
        if (errors.length > 0) {
            throw new AggregateError(errors, message);
        }
    }

    return {
        adapters,
        async read(key) {
            return queue.run("read", key, async () => {
                for (const adapter of adapters) {
                    const value = await adapter.read(key);
                    if (value !== undefined) {
                        return value;
                    }
                }
                return undefined;
            });
        },
        async write(key, value) {
            return queue.run("write", key, async () =>
                replicate(async adapter => adapter.write(key, value), "Aggregate cache write failed."),
            );
        },
        async remove(key) {
            return queue.run("remove", key, async () =>
                replicate(async adapter => adapter.remove(key), "Aggregate cache removal failed."),
            );
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}
