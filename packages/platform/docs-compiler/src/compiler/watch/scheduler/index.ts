/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Logger } from "@whiteeclipse/log";
import type { Reference, Snapshot, WatchResult, WatchSubscriptionContext } from "../../../types/index.js";
import { createLatestChannel } from "../channel.js";
import { disposeScheduler } from "./dispose.js";
import { initialize, invalidate, reportError } from "./rebuild.js";
import type { SchedulerState } from "./state.js";


/** A prepared generation and cleanup deferred until after publication. */
export interface WatchPublication {
    /** Prepared replacement snapshot to deliver to consumers. */
    readonly snapshot: Snapshot;

    /**
     * Disposes the previous snapshot and prunes subscriptions after publication.
     * A failure does not roll back the replacement snapshot.
     *
     * @returns Completion of previous-generation cleanup.
     * @rejects If snapshot disposal or subscription cleanup fails.
     */
    retire(this: void): Promise<void>;
}

/** Compiler-owned operations borrowed by the scheduler. */
export interface WatchOperations extends AsyncDisposable {
    /** Session cancellation shared with subscriptions and build scopes. */
    readonly signal: AbortSignal;
    /** Logger receiving recoverable build, subscription, and cleanup failures. */
    readonly logger: Logger;

    /**
     * Prepares a replacement using a coalesced batch of source invalidations.
     * An empty batch is used for the initial build.
     *
     * @param changes Changed references, including invalidations retained after failed builds.
     * @returns Replacement snapshot and cleanup to run after publication.
     * @rejects If the build fails; the previous successful snapshot remains active.
     */
    build(this: void, changes: readonly Reference[]): Promise<WatchPublication>;

    /**
     * Signals cancellation and starts subscription and current-snapshot cleanup.
     * The scheduler also waits for its active build before disposing remaining resources.
     *
     * @returns Completion of subscription and current-snapshot cleanup.
     * @rejects If shutdown cleanup fails.
     */
    stop(this: void): Promise<void>;

    /**
     * Releases remaining compiler-owned resources after shutdown work settles.
     *
     * @returns Completion of final resource cleanup.
     * @rejects If resource cleanup fails.
     */
    [Symbol.asyncDispose](this: void): Promise<void>;
}

/** Coalesced scheduling and subscription notifications for a single watch session. */
export interface WatchScheduler extends WatchSubscriptionContext {
    /** Latest-value snapshot and error streams, with session shutdown through disposal. */
    readonly result: WatchResult;

    /**
     * Performs the first build and publication before enabling the rebuild worker.
     * Called once; notifications received during the initial build remain pending.
     *
     * @returns Completion of initial publication and previous-generation retirement.
     * @rejects If the initial build fails.
     */
    initialize(this: void): Promise<void>;
}

/**
 * Creates a scheduler with one active build and at most one pending rebuild.
 *
 * @param operations Resource-owning compiler operations.
 * @returns A session controller; initialization performs its first build.
 */
export function createWatchScheduler(operations: WatchOperations): WatchScheduler {
    const state: SchedulerState = {
        operations,
        snapshots: createLatestChannel<Snapshot>(),
        errors: createLatestChannel<unknown>(),
        pending: new Map(),
        retry: new Map(),
        lifecycle: { started: false, closed: false, running: undefined, disposal: undefined },
    };
    const result: WatchResult = {
        errors: state.errors.values,
        [Symbol.asyncIterator]() {
            return {
                next: state.snapshots.values.next.bind(state.snapshots.values),
                async return() {
                    await disposeScheduler(state);
                    return { done: true, value: undefined };
                },
            };
        },
        async [Symbol.asyncDispose]() {
            await disposeScheduler(state);
        },
    };

    return {
        signal: operations.signal,
        result,
        reportError(error) {
            reportError(error, state);
        },
        invalidate(references) {
            invalidate(references, state);
        },
        async initialize() {
            await initialize(state);
        },
    };
}
