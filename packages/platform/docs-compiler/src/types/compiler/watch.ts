/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Reference } from "./reference.js";
import type { Snapshot } from "../snapshot.js";


/**
 * Services supplied to an environment-specific subscription implemented by a plugin.
 * The compiler manages its lifetime; plugins provide the watching mechanism and cleanup.
 */
export interface WatchSubscriptionContext {
    /** Session cancellation, independent of individual builds. */
    readonly signal: AbortSignal;

    /**
     * Marks sources or repository inventories as changed.
     * Notifications are coalesced by source identity into at most one pending rebuild.
     * Calls after session closure are ignored.
     *
     * @param references Changed sources or inventories requiring reprocessing.
     */
    invalidate(this: void, references: Reference | readonly Reference[]): void;

    /**
     * Logs a recoverable subscription failure and publishes it to the error stream.
     * Does not trigger a rebuild or end the session; calls after closure are ignored.
     *
     * @param error Subscription failure to report.
     */
    reportError(this: void, error: unknown): void;
}

/**
 * Starts watching a source using the plugin's environment-specific mechanism.
 * Plugins await registration through the hook context's watch method so setup failures
 * reach the compiler. The returned cleanup is called when the subscription is removed
 * or the session shuts down.
 *
 * @param context Session cancellation and change/error notification services.
 * @returns Cleanup callback, directly or after asynchronous setup completes.
 */
export type WatchSubscription = (context: WatchSubscriptionContext) => Promisable<() => Promisable<void>>;

/**
 * Consumer handle for a watch session whose resources remain owned by the compiler.
 * Snapshot iteration retains only the latest unread snapshot. Successful replacement
 * invalidates the previous snapshot; failed rebuilds keep it active. Returning from
 * snapshot iteration, including breaking a for-await loop, shuts down the session.
 */
export interface WatchResult extends AsyncIterable<Snapshot>, AsyncDisposable {
    /**
     * Recoverable build, subscription, and cleanup errors; retains the latest unread error.
     * The stream closes during session shutdown; shutdown failures reject disposal instead.
     */
    readonly errors: AsyncIterable<unknown>;

    /**
     * Stops admission and delivery, cancels work, invalidates the current snapshot,
     * and drains builds and cleanup before releasing compiler-owned resources.
     * Repeated calls share the same shutdown outcome.
     *
     * @returns Completion of session shutdown.
     * @rejects With an AggregateError if any shutdown operation fails.
     */
    [Symbol.asyncDispose](this: void): Promise<void>;
}
