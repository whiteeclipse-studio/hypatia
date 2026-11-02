/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createOperationQueue } from "@whiteeclipse/async-queue";
import { getLogger } from "@whiteeclipse/log";


/** Orders cache operations and records outcomes without configuring logging. */
interface CacheOperationQueue extends AsyncDisposable {
    /**
     * Admits an operation in invocation order and records its outcome.
     *
     * @param operation Cache operation name.
     * @param key Opaque resource identifier, recorded only at trace level.
     * @param action Operation to perform after previous actions settle.
     * @returns The original operation result.
     * @rejects With the original failure if disposed or the operation fails.
     */
    run<Result>(
        operation: "read" | "write" | "remove",
        key: string,
        action: () => Result | PromiseLike<Result>,
    ): Promise<Result>;
}

/**
 * Adds cache diagnostics to the shared sequential queue and its one-time cleanup.
 *
 * @param adapter Adapter category suffix.
 * @param cleanup Cleanup invoked once after admitted operations settle.
 * @returns A queue retaining operation ordering and draining disposal.
 * @rejects Returned operations propagate original action and cleanup failures.
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
