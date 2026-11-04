/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
/// <reference lib="webworker" />
import { defaultUpdateTtlMs, type PublicProject } from "../../../app/configuration";
import { timing } from "../../../shared/constants";
import { type ArchiveRecord, archiveStorage, readRecord, writeRecord } from "../storage/archives";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import type { CacheAdapter } from "@whiteeclipse/cache";
import { type ArchiveSession, createArchiveSession } from "./session";
import { download } from "./download";


declare const self: DedicatedWorkerGlobalScope;
const context = self;
let project: PublicProject | undefined;
let storage: CacheAdapter | undefined;
let session: ArchiveSession | undefined;
let inFlight: Promise<void> | undefined;
let restoredKey: string | undefined;
let closed = false;

/**
 * Posts a typed response while the worker is active.
 *
 * @param message The message value.
 */
function send(message: WorkerResponse): void {
    if (!closed) {
        context.postMessage(message);
    }
}

/**
 * Restores a complete persisted archive without another network request.
 *
 * @param cache The cache value.
 * @param url The url value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 * @throws {Error} If the supplied input or current state is invalid.
 */
async function restore(cache: CacheAdapter, url: string): Promise<ArchiveRecord | undefined> {
    const record = await readRecord(cache, url);
    if (record === undefined || record.archiveKey === restoredKey || record.archiveKey === "") {
        return record;
    }
    const blob = await cache.read(record.archiveKey);
    if (blob === undefined) {
        return { ...record, checkedAt: 0, etag: undefined, modified: undefined };
    }
    try {
        await session?.replace(cache, blob, record);
    } catch (error) {
        await cache.remove(`record:${url}`);
        throw error;
    }
    restoredKey = record.archiveKey;
    return record;
}

/**
 * Checks freshness while holding the cross-tab source lock.
 *
 * @param cache The cache value.
 * @param current The current value.
 * @param force The force value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function check(cache: CacheAdapter, current: PublicProject, force: boolean): Promise<void> {
    const url = current.archiveUrl;
    if (url === undefined) {
        return;
    }
    const record = await restore(cache, url);
    const deadline = Math.max(
        (record?.checkedAt ?? 0) + (current.updateTtlMs ?? defaultUpdateTtlMs),
        record?.retryAt ?? 0,
    );
    if (!force && Date.now() < deadline) {
        return;
    }
    const next = await download(url, record?.archiveKey === "" ? undefined : record);
    if (next === undefined) {
        if (record !== undefined) {
            await writeRecord(cache, url, { ...record, checkedAt: Date.now(), retryAt: 0 });
        }
        return;
    }
    await session?.replace(cache, next.blob, next.record);
    restoredKey = next.record.archiveKey;
    if (record !== undefined && record.archiveKey !== "" && record.archiveKey !== next.record.archiveKey) {
        await cache.remove(record.archiveKey);
    }
}

/**
 * Reports a retryable background failure without discarding visible documentation.
 *
 * @param url The url value.
 * @param error The error value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function failed(url: string, error: unknown): Promise<void> {
    if (storage !== undefined) {
        try {
            const record = await readRecord(storage, url);
            await writeRecord(storage, url, {
                version: 1,
                archiveKey: "",
                checkedAt: 0,
                ...record,
                retryAt: Date.now() + timing.retry,
            });
        } catch {
            /* The generated page remains available when storage fails. */
        }
    }
    send({ type: "status", updating: false, error: String(error), restart: session?.needsRestart() ?? false });
}

/**
 * Opens retained storage and serializes checks across tabs where Web Locks exists.
 *
 * @param current The current value.
 * @param force The force value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function update(current: PublicProject, force: boolean): Promise<void> {
    const url = current.archiveUrl;
    if (url === undefined) {
        return;
    }
    send({ type: "status", updating: true });
    try {
        const cache = (storage ??= await archiveStorage());
        if (typeof navigator.locks === "undefined") {
            await check(cache, current, force);
        } else {
            await navigator.locks.request(`docs-update:${url}`, async () => check(cache, current, force));
        }
        send({ type: "status", updating: false });
    } catch (error) {
        await failed(url, error);
    }
}

/**
 * Handles initialization, refresh and orderly watch-session disposal.
 *
 * @param event The event value.
 */
context.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const message = event.data;
    if (message.type === "close") {
        closed = true;
        void (async () => {
            await session?.[Symbol.asyncDispose]();
            await storage?.[Symbol.asyncDispose]();
            context.close();
        })();
        return;
    }
    if (message.type === "start" && project === undefined) {
        project = message.project;
        session = createArchiveSession(project, data => {
            send({ type: "project", generation: data.index.generation, data });
        });
    }
    if (project === undefined || inFlight !== undefined) {
        return;
    }
    inFlight = update(project, message.force === true).finally(() => {
        inFlight = undefined;
    });
};
