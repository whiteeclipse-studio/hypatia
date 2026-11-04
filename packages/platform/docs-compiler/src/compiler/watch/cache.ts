/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "@whiteeclipse/cache";
import { createOperationQueue } from "@whiteeclipse/async-queue";
import type { ArtifactPayload } from "../../types";
import type { SourceRecord } from "../pipeline/incremental";
import { throwIfErrors } from "../errors";


/** A generation's temporary cache use, released after its reads and cleanup finish. */
export interface WatchCacheFrame {
    /** Borrowed adapter recording keys touched during this build's lifetime. */
    readonly cache: CacheAdapter;

    /**
     * Releases this frame's key protection and removes keys no longer in use.
     * Called after the build's admitted reads and resource cleanup finish.
     * Repeated calls have no further effect.
     *
     * @returns Completion of unused-key removal.
     * @rejects If cache cleanup fails.
     */
    release(this: void): Promise<void>;
}

/**
 * Compiler-owned cache bookkeeping shared across watch builds.
 * Disposal drains queued operations and clears bookkeeping without disposing backing storage.
 */
export interface WatchCache extends AsyncDisposable {
    /** Borrowed adapter whose touched keys remain protected for the session. */
    readonly cache: CacheAdapter;

    /**
     * Creates a borrowed cache view with its own set of protected keys.
     *
     * @returns A frame released when its build or snapshot is disposed.
     */
    frame(this: void): WatchCacheFrame;

    /**
     * Replaces the payload-key set protected by the latest successful source records.
     * Key removal is deferred until a frame is released.
     *
     * @param records Source records retained by the successful build.
     */
    retain(this: void, records: ReadonlyMap<string, SourceRecord>): void;

    /**
     * Copies cached bytes before decoding, then clones the decoded value for the caller.
     * The queued byte copy finishes before subsequent queued cache removals can run.
     *
     * @param payload Cache key and decoder describing the artifact's content.
     * @returns Independently owned decoded content.
     * @rejects If reading, decoding, or cloning fails, or the payload is missing.
     */
    readPayload(this: void, payload: ArtifactPayload): Promise<unknown>;
}

/**
 * Tracks generation key sets without reference counting or owning backing storage.
 *
 * @param backing Shared cache owned by compile.
 * @returns Key bookkeeping disposed by compile before its backing cache.
 */
export function createWatchCache(backing: CacheAdapter): WatchCache {
    const owned = new Set<string>();
    const frames = new Set<Set<string>>();
    let live = new Set<string>();
    const queue = createOperationQueue(async () => {
        owned.clear();
        frames.clear();
        await Promise.resolve();
    });

    /**
     * Removes only keys unused by published records and all active generations.
     *
     * @returns Completion of all removal attempts.
     * @rejects If any backing removal fails.
     */
    async function prune(): Promise<void> {
        await queue.run(async () => {
            const protectedKeys = new Set([...live, ...[...frames].flatMap(keys => [...keys])]);
            const errors: unknown[] = [];
            for (const key of owned) {
                if (protectedKeys.has(key)) {
                    continue;
                }
                try {
                    await backing.remove(key);
                    owned.delete(key);
                } catch (error) {
                    errors.push(error);
                }
            }
            throwIfErrors(errors, "Watch cache cleanup failed.");
        });
    }

    /**
     * Creates a borrowed cache view protecting the keys touched by its owner.
     *
     * @param keys Owner's key set.
     * @returns An adapter that cannot dispose shared storage or overwrite versioned data.
     */
    function view(keys: Set<string>): CacheAdapter {
        return Object.freeze({
            async read(key: string) {
                return queue.run(async () => {
                    keys.add(key);
                    return backing.read(key);
                });
            },
            async write(key: string, contents: Blob) {
                await queue.run(async () => {
                    keys.add(key);
                    owned.add(key);
                    const existing = await backing.read(key);
                    if (existing !== undefined) {
                        if (!(await equalContents(existing, contents))) {
                            throw new Error(`Cannot overwrite immutable watch payload ${key}.`);
                        }
                        return;
                    }
                    await backing.write(key, contents);
                });
            },
            async remove(key: string) {
                await queue.run(async () => {
                    if (live.has(key) || [...frames].some(frame => frame !== keys && frame.has(key))) {
                        throw new Error(`Cannot remove live watch payload ${key}.`);
                    }
                    await backing.remove(key);
                    keys.delete(key);
                    owned.delete(key);
                });
            },
            async [Symbol.asyncDispose]() {
                await Promise.reject(new Error("The compiler owns the shared cache."));
            },
        });
    }

    const sessionKeys = new Set<string>();
    frames.add(sessionKeys);
    return {
        cache: view(sessionKeys),
        frame() {
            const keys = new Set<string>();
            frames.add(keys);
            let released = false;
            return {
                cache: view(keys),
                async release() {
                    if (!released) {
                        released = true;
                        frames.delete(keys);
                        await prune();
                    }
                },
            };
        },
        retain(records) {
            live = new Set([...records.values()].flatMap(record => [...record.payloadKeys]));
        },
        async readPayload(payload) {
            const copy = await queue.run(async () => {
                const content = await backing.read(payload.key);
                if (content === undefined) {
                    throw new Error(`Snapshot payload ${payload.key} is unavailable.`);
                }
                return new Blob([await content.arrayBuffer()], { type: content.type });
            });
            return structuredClone(await payload.decode(copy));
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}

/**
 * Compares immutable payloads before skipping a duplicate write.
 *
 * @param first Previously cached bytes, consumed before returning.
 * @param second Proposed payload.
 * @returns Whether bytes and MIME types match.
 * @rejects If either Blob is unreadable.
 */
async function equalContents(first: Blob, second: Blob): Promise<boolean> {
    if (first.size !== second.size || first.type !== second.type) {
        return false;
    }
    const left = new Uint8Array(await first.arrayBuffer());
    const right = new Uint8Array(await second.arrayBuffer());
    return left.every((byte, index) => byte === right[index]);
}
