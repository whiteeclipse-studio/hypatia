/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createOperationQueue } from "@whiteeclipse/async-queue";
import { getLogger } from "@whiteeclipse/log";


/** Logs sequential cache operations. */
interface CacheOperationQueue extends AsyncDisposable {
    /**
     * Queues an operation and logs its outcome.
     *
     * @param operation Operation name.
     * @param key Resource identifier, logged at trace level only.
     * @param action Action to run.
     * @returns The action's result.
     * @rejects If disposed or the action fails, preserving the original error.
     */
    run<Result>(
        operation: "read" | "write" | "remove",
        key: string,
        action: () => Result | PromiseLike<Result>,
    ): Promise<Result>;
}

/**
 * Adds cache logging to a sequential queue.
 *
 * @param adapter Logger category suffix.
 * @param cleanup Runs once after queued operations settle.
 * @returns The operation queue.
 */
export function createCacheOperationQueue(adapter: string, cleanup: () => Promise<void>): CacheOperationQueue {
    const logger = getLogger(["whiteeclipse", "cache", adapter]);
    const queue = createOperationQueue(async () => {
        logger.debug("Disposing cache.");
        try {
            await cleanup();
            logger.debug("Disposed cache.");
        } catch (error) {
            logger.error("Cache disposal failed.", { error });
            throw error;
        }
    });

    return {
        async run(operation, key, action) {
            try {
                return await queue.run(async () => {
                    logger.trace("Cache {operation} started.", { operation, key });
                    const result = await action();
                    if (operation === "read") {
                        const value: unknown = result;
                        logger.trace("Cache read completed (hit: {hit}).", { key, hit: value !== undefined });
                    } else {
                        logger.trace("Cache {operation} completed.", { operation, key });
                    }
                    return result;
                });
            } catch (error) {
                logger.error("Cache {operation} failed.", { operation, error });
                throw error;
            }
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}
