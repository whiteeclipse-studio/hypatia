/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Shares cleanup ownership between failed construction and LogTape reset.
 * Async disposal takes precedence when both protocols are provided.
 *
 * @param resource A factory result.
 * @returns A view with idempotent disposal and unchanged callable behavior.
 */
export function manageDisposable<T extends object>(resource: T): T {
    let dispose: typeof Symbol.asyncDispose | typeof Symbol.dispose = Symbol.dispose;
    if (Symbol.asyncDispose in resource) {
        dispose = Symbol.asyncDispose;
    }
    if (!(dispose in resource)) {
        return resource;
    }
    let started = false;
    let result: unknown;
    let failure: unknown;
    let failed = false;
    /**
     * Invokes the preferred cleanup protocol at most once.
     *
     * @returns The original cleanup result.
     * @throws {unknown} The original synchronous cleanup failure.
     */
    // This synchronous protocol dispatcher may return an asynchronous disposer's promise unchanged.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    function cleanup(): unknown {
        if (!started) {
            started = true;
            try {
                const method: unknown = Reflect.get(resource, dispose);
                if (typeof method !== "function") {
                    throw new TypeError("A disposal hook must be callable.");
                }
                result = Reflect.apply(method, resource, []);
            } catch (error) {
                failed = true;
                failure = error;
            }
        }
        if (failed) {
            throw failure;
        }
        return result;
    }
    return new Proxy(resource, {
        has(target, key) {
            if (key === Symbol.dispose && dispose === Symbol.asyncDispose) {
                return false;
            }
            return Reflect.has(target, key);
        },
        // A proxy getter must synchronously return the underlying property value.
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        get(target, key, receiver): unknown {
            if (key === dispose) {
                return cleanup;
            }
            return Reflect.get(target, key, receiver);
        },
    });
}
