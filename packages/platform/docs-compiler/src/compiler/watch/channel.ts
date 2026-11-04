/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Delivers values while retaining at most one unread value. */
export interface LatestChannel<Value> {
    /** Iterator receiving published values; pending reads complete when closed. */
    readonly values: AsyncIterableIterator<Value>;

    /**
     * Delivers a value to the oldest pending reader, or replaces the unread value.
     * Calls after closure are ignored.
     *
     * @param value Value to deliver.
     */
    publish(this: void, value: Value): void;

    /**
     * Ends delivery, discards the unread value, and completes pending reads.
     * Repeated calls have no further effect.
     */
    close(this: void): void;
}

/**
 * Creates a latest-value channel so slow consumers cannot accumulate stale snapshots.
 *
 * @returns A channel whose pending reads finish when closed.
 */
export function createLatestChannel<Value>(): LatestChannel<Value> {
    let slot: { value: Value } | undefined;
    let closed = false;

    const waiting: ((result: IteratorResult<Value>) => void)[] = [];
    const values: AsyncIterableIterator<Value> = {
        [Symbol.asyncIterator]() {
            return values;
        },
        async next() {
            if (closed) {
                return { done: true, value: undefined };
            }

            if (slot !== undefined) {
                const result = slot;
                slot = undefined;
                return { done: false, value: result.value };
            }

            return new Promise<IteratorResult<Value>>(resolve => {
                waiting.push(resolve);
            });
        },
    };

    return {
        values,
        publish(value) {
            if (closed) {
                return;
            }

            const consumer = waiting.shift();
            if (consumer === undefined) {
                slot = { value };
            } else {
                consumer({ done: false, value });
            }
        },
        close() {
            closed = true;
            slot = undefined;
            for (const resolve of waiting.splice(0)) {
                resolve({ done: true, value: undefined });
            }
        },
    };
}
