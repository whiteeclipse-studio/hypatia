/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import { throwIfRejected } from "./errors.js";


/**
 * A compiler-owned build lifetime, separate from the watch session lifetime.
 * Disposal cancels the scope, runs its registered cleanup, and removes it from its owner.
 */
export interface BuildScope extends AsyncDisposable {
    /** Cancellation triggered by either session shutdown or disposal of this scope. */
    readonly signal: AbortSignal;

    /**
     * Registers cleanup for a build attempt or its resulting snapshot.
     * Callbacks run in reverse registration order when the scope is disposed.
     *
     * @param cleanup Callback releasing a resource borrowed by the build.
     * @throws {ReferenceError} If the scope has already been disposed.
     */
    onDispose(this: void, cleanup: () => Promisable<void>): void;
}

/**
 * Dynamic build scopes owned and finally disposed by compile.
 * Disposal attempts cleanup of every remaining scope and aggregates failures.
 */
export interface BuildScopes extends AsyncDisposable {
    /**
     * Creates and tracks an independent build scope linked to session cancellation.
     *
     * @returns A scope retained until its own disposal or compiler shutdown.
     */
    create(this: void): BuildScope;
}

/**
 * Creates the compiler's dynamic resource owner for build attempts.
 *
 * @param signal Session cancellation signal.
 * @returns An owner that releases all still-active scopes during compiler shutdown.
 */
export function createBuildScopes(signal: AbortSignal): BuildScopes {
    const scopes = new Set<BuildScope>();
    return {
        create() {
            const resources = new AsyncDisposableStack();
            const shutdown = new AbortController();
            const scope: BuildScope = {
                signal: AbortSignal.any([signal, shutdown.signal]),
                onDispose(cleanup) {
                    resources.defer(cleanup);
                },
                async [Symbol.asyncDispose]() {
                    shutdown.abort();
                    try {
                        await resources.disposeAsync();
                    } finally {
                        scopes.delete(scope);
                    }
                },
            };
            scopes.add(scope);
            return scope;
        },
        async [Symbol.asyncDispose]() {
            const results = await Promise.allSettled([...scopes].map(async scope => scope[Symbol.asyncDispose]()));
            throwIfRejected(results, "Build resource cleanup failed.");
        },
    };
}
