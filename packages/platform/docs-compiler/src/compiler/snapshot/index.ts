/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Repository, Snapshot } from "../../types/index.js";
import { captureRepository } from "./handles.js";
import { assertActive, disposeSnapshot, iterate, type SnapshotState } from "./lifetime.js";


export { copyMetadata } from "./metadata.js";

/**
 * Captures a fixed inventory and owns its handles and resource cleanup.
 *
 * @param repositories Completed plugin repositories.
 * @param cleanup Releases compilation resources after admitted reads settle.
 * @returns An immutable, disposable snapshot.
 * @throws {Error} If repository IDs or artifact paths conflict.
 */
export function createSnapshot(repositories: readonly Repository[], cleanup: () => Promise<void>): Snapshot {
    const state: SnapshotState = {
        lifetime: { active: true, disposal: undefined },
        reads: new Set(),
        inventory: new Map(),
        cleanup,
    };
    for (const source of repositories) {
        captureRepository(source, state);
    }

    const snapshot: Snapshot = Object.freeze({
        get size() {
            assertActive(state);
            return state.inventory.size;
        },
        get(key: string) {
            assertActive(state);
            return state.inventory.get(key);
        },
        has(key: string) {
            assertActive(state);
            return state.inventory.has(key);
        },
        entries() {
            assertActive(state);
            return iterate(state.inventory.entries(), state);
        },
        keys() {
            assertActive(state);
            return iterate(state.inventory.keys(), state);
        },
        values() {
            assertActive(state);
            return iterate(state.inventory.values(), state);
        },
        [Symbol.iterator]() {
            assertActive(state);
            return iterate(state.inventory.entries(), state);
        },
        forEach(
            callback: (value: Repository, key: string, map: ReadonlyMap<string, Repository>) => void,
            thisArg?: unknown,
        ) {
            assertActive(state);
            for (const [key, value] of iterate(state.inventory.entries(), state)) {
                callback.call(thisArg, value, key, snapshot);
            }
        },
        async [Symbol.asyncDispose]() {
            await disposeSnapshot(state);
        },
    });
    return snapshot;
}
