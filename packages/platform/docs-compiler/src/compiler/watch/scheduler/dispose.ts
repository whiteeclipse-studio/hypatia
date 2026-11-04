/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { throwIfRejected } from "../../errors.js";
import type { SchedulerState } from "./state.js";


/**
 * Stops admission and delivery, cancels work, and drains compiler-owned resources.
 * Repeated requests share the recorded shutdown outcome.
 *
 * @param state Shared watch-session state.
 * @returns The shared shutdown result.
 * @rejects If shutdown fails; failures from both phases are chained in a SuppressedError.
 */
export async function disposeScheduler(state: SchedulerState): Promise<void> {
    const { lifecycle } = state;
    if (lifecycle.disposal === undefined) {
        lifecycle.closed = true;
        state.pending.clear();
        state.retry.clear();
        state.snapshots.close();
        state.errors.close();
        const stopping = state.operations.stop();

        const cleanup = new AsyncDisposableStack();
        cleanup.use(state.operations);
        // Drain work before disposing the compiler resources registered above.
        cleanup.defer(async () => {
            const results = await Promise.allSettled([stopping, lifecycle.running]);
            throwIfRejected(results, "Watch session cleanup failed.");
        });

        lifecycle.disposal = cleanup.disposeAsync();
    }
    return lifecycle.disposal;
}
