/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "async-queue"]);
let nextQueueId = 0;

/** Sequential operation queue with draining disposal. */
export interface OperationQueue extends AsyncDisposable {
    /**
     * Queues an action.
     *
     * Runs after earlier actions settle, even if they fail.
     *
     * @param action Action to run.
     * @returns The action's result.
     * @rejects If disposal has started or the action fails.
     */
    run<Result>(action: () => Result | PromiseLike<Result>): Promise<Result>;

    /**
     * Disposes the queue.
     *
     * Rejects new actions, drains the queue, and runs cleanup once.
     *
     * @returns The shared cleanup outcome, including on repeated calls.
     * @rejects If cleanup fails.
     */
    [Symbol.asyncDispose](): Promise<void>;
}

/**
 * Creates an operation queue.
 *
 * @param cleanup Runs once after queued actions settle.
 * @returns The operation queue.
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
