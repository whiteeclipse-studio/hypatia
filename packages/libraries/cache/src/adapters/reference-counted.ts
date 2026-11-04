/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { createOperationQueue } from "@whiteeclipse/async-queue";
import type { CacheAdapter } from "../types.js";


/** A cache owning its backing adapter and explicit per-key payload references. */
export interface ReferenceCountedCacheAdapter extends CacheAdapter {
    /**
     * Acquires a reference without requiring the payload to exist.
     *
     * @param key Payload identifier.
     * @returns Completion after the reference is acquired.
     * @rejects If the adapter is disposed.
     */
    acquire(key: string): Promise<void>;
    /**
     * Releases a reference, removing the payload after the final release.
     *
     * @param key Payload identifier.
     * @returns Completion after release and any final removal.
     * @rejects If unacquired, disposed, or removal fails; failed removals preserve the reference.
     */
    release(key: string): Promise<void>;
}

/**
 * Transfers exclusive ownership of an adapter to a serialized reference-counted wrapper.
 *
 * @param adapter Backing cache; do not access or dispose it independently.
 * @returns The wrapper owning the backing adapter.
 */
export function createReferenceCountedCacheAdapter(adapter: CacheAdapter): ReferenceCountedCacheAdapter {
    const references = new Map<string, number>();
    const queue = createOperationQueue(async () => {
        references.clear();
        await adapter[Symbol.asyncDispose]();
    });
    return {
        async read(key) {
            return queue.run(async () => adapter.read(key));
        },
        async write(key, contents) {
            await queue.run(async () => adapter.write(key, contents));
        },
        async remove(key) {
            await queue.run(async () => {
                if (references.has(key)) {
                    throw new Error(`Cannot remove referenced payload: ${key}.`);
                }
                await adapter.remove(key);
            });
        },
        async acquire(key) {
            await queue.run(() => {
                references.set(key, (references.get(key) ?? 0) + 1);
            });
        },
        async release(key) {
            await queue.run(async () => {
                const count = references.get(key);
                if (count === undefined) {
                    throw new Error(`Cannot release unacquired payload: ${key}.`);
                }
                if (count === 1) {
                    await adapter.remove(key);
                    references.delete(key);
                } else {
                    references.set(key, count - 1);
                }
            });
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}
