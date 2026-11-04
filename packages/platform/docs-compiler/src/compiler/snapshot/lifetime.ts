/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Repository } from "../../types/index.js";
import { defer } from "../defer.js";
import { throwIfErrors } from "../errors.js";


/** Invalidation and the shared cleanup outcome for a snapshot's handles. */
interface SnapshotLifetime {
    /** Whether new reads and handle access are still admitted. */
    active: boolean;
    /** Cleanup result shared by every disposal request. */
    disposal: Promise<void> | undefined;
}

/** Private state shared by the snapshot map, its handles, and disposal operations. */
export interface SnapshotState {
    /** Invalidation status and the recorded cleanup operation. */
    readonly lifetime: SnapshotLifetime;
    /** Admitted content reads that must settle before resource cleanup. */
    readonly reads: Set<Promise<unknown>>;
    /** Captured repositories; cleared after resource cleanup, including on failure. */
    readonly inventory: Map<string, Repository>;
    /** Releases compiler-owned resources after admitted reads settle. */
    cleanup(this: void): Promise<void>;
}

/**
 * Rejects access to invalidated snapshot handles.
 *
 * @param state Shared snapshot state.
 * @throws {ReferenceError} If the snapshot was invalidated.
 */
export function assertActive(state: SnapshotState): void {
    if (!state.lifetime.active) {
        throw new ReferenceError("The snapshot is no longer active.");
    }
}

/**
 * Checks validity on every iterator step, including steps after exhaustion.
 *
 * @param source Private inventory iterator.
 * @param state Shared snapshot state.
 * @returns The iterator with lifetime-guarded advancement.
 */
export function iterate<Value>(source: MapIterator<Value>, state: SnapshotState): MapIterator<Value> {
    const iterator = source;
    const next = iterator.next.bind(iterator);
    /**
     * Advances the inventory only while its snapshot is active.
     *
     * @param arguments_ Iterator protocol arguments.
     * @returns The next entry or an exhaustion marker.
     * @throws {ReferenceError} If the snapshot was invalidated.
     */
    iterator.next = (...arguments_: [] | [unknown]): IteratorResult<Value, undefined> => {
        assertActive(state);
        return next(...arguments_);
    };
    return iterator;
}

/**
 * Admits a content read before plugin code runs and returns an independent copy.
 *
 * @param artifact Plugin artifact whose read method retains its original receiver.
 * @param artifact.read Reader returning the artifact's concrete contents.
 * @param state Shared snapshot state.
 * @returns Independently owned artifact contents.
 * @rejects If invalidated, reading fails, or the contents cannot be cloned.
 */
export async function readArtifact<Contents>(
    artifact: { read(): Promise<Contents> },
    state: SnapshotState,
): Promise<Contents> {
    assertActive(state);
    // Admit before invoking plugin code so synchronous disposal cannot miss this read.
    const reading = defer(async () => structuredClone(await artifact.read()));
    state.reads.add(reading);
    try {
        return await reading;
    } finally {
        state.reads.delete(reading);
    }
}

/**
 * Drains admitted reads and releases resources, flattening suppressed cleanup failures.
 *
 * @param state Shared snapshot state, already invalidated.
 * @returns Completion of cleanup and inventory clearing.
 * @rejects With an AggregateError containing cleanup failures and their original cause.
 */
async function finishDisposal(state: SnapshotState): Promise<void> {
    await Promise.allSettled(state.reads);
    try {
        await state.cleanup();
    } catch (error) {
        const errors: unknown[] = [];
        let current: unknown = error;
        while (current instanceof SuppressedError) {
            errors.push(current.error);
            current = current.suppressed;
        }
        errors.push(current);
        throwIfErrors(errors, "Snapshot cleanup failed.", { cause: error });
    } finally {
        state.inventory.clear();
    }
}

/**
 * Invalidates all handles immediately and records cleanup once for repeated requests.
 *
 * @param state Shared snapshot state.
 * @returns The shared cleanup outcome after admitted reads settle.
 * @rejects With an AggregateError if resource cleanup fails.
 */
export async function disposeSnapshot(state: SnapshotState): Promise<void> {
    const { lifetime } = state;
    lifetime.active = false;
    lifetime.disposal ??= finishDisposal(state);
    return lifetime.disposal;
}
