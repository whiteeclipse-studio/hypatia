/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "../types.ts";
import { createCacheOperationQueue } from "../operations.ts";
import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "cache", "aggregate"]);

/**
 * Cache combining multiple adapters.
 *
 * Reads stop at the first hit or error, in child priority order.
 *
 * Writes and removals run concurrently across distinct children.
 * Failures are collected in an AggregateError without rollback.
 *
 * Operations run sequentially. Disposal drains operations, disposes each distinct
 * child once, and collects clean-up failures in an AggregateError.
 *
 * Owns its children; do not mutate or dispose them independently.
 */
export interface AggregateCacheAdapter<T extends readonly CacheAdapter[]> extends CacheAdapter {
    /** Children in read-priority order; do not mutate while in use. */
    readonly adapters: T;
}

/**
 * Creates an aggregate cache.
 *
 * An empty aggregate always misses and otherwise does nothing.
 *
 * @param adapters Children in read-priority order.
 * @returns The aggregate cache.
 * @rejects Returned operations reject if disposed or a child fails.
 */
export function createAggregateCacheAdapter<const T extends readonly CacheAdapter[]>(
    ...adapters: T
): AggregateCacheAdapter<T> {
    logger.debug("Creating aggregate cache with {childCount} children.", { childCount: adapters.length });
    const queue = createCacheOperationQueue("aggregate", async () =>
        replicate(async adapter => adapter[Symbol.asyncDispose](), "Aggregate cache disposal failed."),
    );

    /**
     * Runs an action on each distinct child, collecting all failures.
     *
     * @param action Child operation.
     * @param message Error message.
     * @returns Completion after all children settle.
     * @rejects With an AggregateError in child order.
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
