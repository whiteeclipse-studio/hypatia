/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Runs an operation in a subsequent microtask, adopting its result or failure.
 *
 * @param operation Work deferred until the current synchronous code finishes.
 * @returns The operation's resolved result.
 * @rejects If the operation throws or its result rejects.
 */
export async function defer<Value>(operation: () => Value): Promise<Awaited<Value>> {
    return await Promise.resolve().then(operation);
}
