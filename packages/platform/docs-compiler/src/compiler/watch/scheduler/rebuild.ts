/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Reference } from "../../../types";
import { defer } from "../../defer";
import { cloneReference, getReferenceKey } from "../../pipeline/reference";
import type { WatchPublication } from "./index";
import type { SchedulerState } from "./state";


/**
 * Reports a recoverable failure without terminating snapshot delivery.
 *
 * @param error Build, watcher, or cleanup failure.
 * @param state Shared watch-session state.
 */
export function reportError(error: unknown, state: SchedulerState): void {
    if (state.lifecycle.closed) {
        return;
    }
    state.operations.logger.error("Watch operation failed.", { error });
    state.errors.publish(error);
}

/**
 * Publishes before invalidating and draining the previous generation.
 *
 * @param publication Prepared generation.
 * @param state Shared watch-session state.
 * @returns Completion of retirement; failures are reported without rolling back publication.
 */
async function publish(publication: WatchPublication, state: SchedulerState): Promise<void> {
    if (!state.lifecycle.closed) {
        state.snapshots.publish(publication.snapshot);
    }
    try {
        await publication.retire();
    } catch (error) {
        reportError(error, state);
    }
}

/**
 * Drains one coalesced invalidation batch at a time.
 * Failed invalidations are retained until a subsequent change notification.
 *
 * @param state Shared watch-session state.
 * @returns Completion when no subsequent changes remain.
 */
async function drain(state: SchedulerState): Promise<void> {
    while (!state.lifecycle.closed && state.pending.size > 0) {
        const changes = new Map([...state.retry, ...state.pending]);
        state.pending.clear();
        state.retry.clear();
        let publication: WatchPublication;
        try {
            publication = await state.operations.build([...changes.values()]);
        } catch (error) {
            for (const [key, reference] of changes) {
                state.retry.set(key, reference);
            }
            reportError(error, state);
            continue;
        }
        await publish(publication, state);
    }
}

/**
 * Schedules one worker regardless of the number of pending notifications.
 *
 * @param state Shared watch-session state.
 */
function schedule(state: SchedulerState): void {
    const { lifecycle } = state;
    if (!lifecycle.started || lifecycle.closed || lifecycle.running !== undefined || state.pending.size === 0) {
        return;
    }
    lifecycle.running = defer(async () => drain(state)).finally(() => {
        lifecycle.running = undefined;
        schedule(state);
    });
}

/**
 * Captures change notifications and requests one coalesced rebuild.
 * Calls after session closure are ignored.
 *
 * @param references Changed sources or repository inventories.
 * @param state Shared watch-session state.
 */
export function invalidate(references: Reference | readonly Reference[], state: SchedulerState): void {
    if (state.lifecycle.closed) {
        return;
    }
    for (const reference of [references].flat()) {
        const captured = cloneReference(reference);
        state.pending.set(getReferenceKey(captured), captured);
    }
    schedule(state);
}

/**
 * Performs the initial build before enabling scheduled rebuilds.
 *
 * @param state Shared watch-session state, initialized once by the compiler.
 * @returns Completion of initial publication and scheduling of any subsequent changes.
 * @rejects If the initial build fails.
 */
export async function initialize(state: SchedulerState): Promise<void> {
    const { lifecycle } = state;
    // Notifications before this point are covered by the initial complete inventory.
    state.pending.clear();
    await publish(await state.operations.build([]), state);
    lifecycle.started = true;
    schedule(state);
}
