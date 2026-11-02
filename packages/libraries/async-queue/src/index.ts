/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "async-queue"]);
let nextQueueId = 0;

/** Orders operations and drains them before running final cleanup once. */
export interface OperationQueue extends AsyncDisposable {
    /**
     * Runs an action after previous actions settle, preserving its own result.
     *
     * A rejected action does not block subsequent actions or final cleanup.
     *
     * @param action Action to admit, including functions that throw synchronously.
     * @returns The action's inferred result.
     * @rejects If disposal has started or the action fails.
     */
    run<Result>(action: () => Result | PromiseLike<Result>): Promise<Result>;

    /**
     * Rejects new actions immediately, drains the queue, and runs cleanup once.
     *
     * @returns Completion of the shared cleanup task, including on repeated calls.
     * @rejects If final cleanup fails.
     */
    [Symbol.asyncDispose](): Promise<void>;
}

/**
 * Creates a queue owning its final cleanup callback.
 *
 * @param cleanup Cleanup to run after admitted operations settle.
 * @returns An asynchronously disposable operation queue.
 * @rejects Returned operations reject if disposed or if their actions or cleanup fail.
 */
export function createOperationQueue(cleanup: () => Promise<void>): OperationQueue {
    const queueId = ++nextQueueId;
    logger.debug("Created operation queue.", { queueId });
    let tail: Promise<void> = Promise.resolve();
    let nextOperationId = 0;
    let closing = false;
    let disposal: Promise<void> | undefined;

    return {
        async run<Result>(action: () => Result | PromiseLike<Result>): Promise<Result> {
            if (closing) {
                logger.warn("Rejected an action after queue disposal started.", { queueId });
                throw new Error("The operation queue is disposed.");
            }
            const operationId = ++nextOperationId;
            logger.trace("Queued action.", { queueId, operationId });
            const result = tail.then(() => {
                logger.trace("Starting queued action.", { queueId, operationId });
                return action();
            });
            tail = result.then(
                () => {
                    logger.trace("Completed queued action.", { queueId, operationId });
                },
                (error: unknown) => {
                    logger.error("Queued action failed.", { queueId, operationId, error });
                },
            );
            return result;
        },
        async [Symbol.asyncDispose]() {
            closing = true;
            if (disposal === undefined) {
                logger.debug("Draining operation queue before disposal.", { queueId });
                disposal = tail.then(async () => {
                    logger.debug("Cleaning up operation queue.", { queueId });
                    try {
                        await cleanup();
                        logger.debug("Disposed operation queue.", { queueId });
                    } catch (error) {
                        logger.error("Operation queue cleanup failed.", { queueId, error });
                        throw error;
                    }
                });
            }
            return disposal;
        },
    };
}
