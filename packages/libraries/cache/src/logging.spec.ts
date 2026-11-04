/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import "fake-indexeddb/auto";
import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { deleteDB, openDB } from "idb";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { makeLogConfigurationBuilder } from "@whiteeclipse/log";
import { createLruMemoryCacheAdapter } from "./adapters/memory.ts";
import { createAggregateCacheAdapter } from "./adapters/aggregate.ts";
import { createFileSystemCacheAdapter } from "./adapters/filesystem.ts";
import { createIndexedDbCacheAdapter } from "./adapters/indexeddb.ts";
import { createCacheOperationQueue } from "./operations.ts";
import type { CacheAdapter } from "./types.ts";


/** Captured cache log records. */
interface RecordedLog {
    level: string;
    category: readonly string[];
    properties: Readonly<Record<string, unknown>>;
    rawMessage: string | TemplateStringsArray;
}

const records: RecordedLog[] = [];
let logging: AsyncDisposable;
const databaseName = "hypatia-cache-logging-test";

beforeEach(async () => {
    records.length = 0;
    logging = await makeLogConfigurationBuilder()
        .withSink({
            name: "capture",
            build: () => record => {
                records.push(record);
            },
        })
        .withLogger({ category: ["whiteeclipse", "cache"], sinks: ["capture"], lowestLevel: "trace" })
        .apply();
});

afterEach(async () => {
    vi.unstubAllGlobals();
    await logging[Symbol.asyncDispose]();
    await deleteDB(databaseName);
});

/**
 * Checks operation trace logs.
 *
 * @param cache Adapter under test.
 * @param adapter Expected category suffix.
 * @returns Completion of the checks.
 * @rejects If an operation or assertion fails.
 */
async function checkOperations(cache: CacheAdapter, adapter: string): Promise<void> {
    expect(await cache.read("synthetic-key")).toBeUndefined();
    await cache.write("synthetic-key", new Blob(["synthetic payload"]));
    expect(await cache.read("synthetic-key")).toBeInstanceOf(Blob);
    await cache.remove("synthetic-key");
    const own = records.filter(record => record.category.at(-1) === adapter);
    expect(own).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ level: "trace", properties: { key: "synthetic-key", hit: false } }),
            expect.objectContaining({ level: "trace", properties: { key: "synthetic-key", hit: true } }),
            expect.objectContaining({ level: "trace", properties: { operation: "write", key: "synthetic-key" } }),
            expect.objectContaining({ level: "trace", properties: { operation: "remove", key: "synthetic-key" } }),
        ]),
    );
    expect(own.some(record => record.level === "warning" || record.level === "error")).toBe(false);
    expect(JSON.stringify(own)).not.toContain("synthetic payload");
}

it("logs memory operations at trace and retention decisions at debug", async () => {
    await using cache = createLruMemoryCacheAdapter(32);
    await checkOperations(cache, "memory");
    await cache.write("first", new Blob(["a".repeat(32)]));
    await cache.write("second", new Blob(["b".repeat(32)]));
    await cache.write("oversized", new Blob(["c".repeat(33)]));
    expect(records).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ level: "debug", rawMessage: "Evicted least recently used cache entry." }),
            expect.objectContaining({ level: "debug", rawMessage: "Skipped oversized cache entry." }),
        ]),
    );
});

it("logs aggregate operations without changing fallback reads", async () => {
    await using cache = createAggregateCacheAdapter(createLruMemoryCacheAdapter(0), createLruMemoryCacheAdapter(32));
    await checkOperations(cache, "aggregate");
});

it("warns when a mapped file disappears but still returns a miss", async () => {
    await using cache = await createFileSystemCacheAdapter();
    await checkOperations(cache, "filesystem");
    await cache.write("missing-file", new Blob(["data"]));
    for (const filename of await readdir(cache.directory)) {
        await rm(join(cache.directory, filename));
    }
    expect(await cache.read("missing-file")).toBeUndefined();
    expect(records).toContainEqual(
        expect.objectContaining({
            level: "warning",
            rawMessage: "Cached file disappeared; treating the read as a miss.",
        }),
    );
});

it("logs IndexedDB operations and warns before closing for a version change", async () => {
    await using cache = await createIndexedDbCacheAdapter(databaseName);
    await checkOperations(cache, "indexeddb");
    const upgraded = await openDB(databaseName, 2);
    upgraded.close();
    expect(records).toContainEqual(
        expect.objectContaining({
            level: "warning",
            rawMessage: "Closing IndexedDB cache connection for an external version change.",
        }),
    );
});

it("logs original write failures while preserving the previous value", async () => {
    await using cache = createLruMemoryCacheAdapter(32);
    await cache.write("key", new Blob(["previous"]));
    const error = new Error("synthetic read failure");
    const blob = new Blob(["replacement"]);
    vi.spyOn(blob, "arrayBuffer").mockRejectedValue(error);
    await expect(cache.write("key", blob)).rejects.toBe(error);
    expect(await (await cache.read("key"))?.text()).toBe("previous");
    expect(records).toContainEqual(
        expect.objectContaining({ level: "error", properties: { operation: "write", error } }),
    );
});

it("warns about partial replication and logs the rejecting aggregate operation", async () => {
    const error = new Error("synthetic backend failure");
    const failing: CacheAdapter = {
        async read() {
            await Promise.resolve();
            return undefined;
        },
        async write() {
            await Promise.resolve();
            throw error;
        },
        async remove() {
            await Promise.resolve();
        },
        async [Symbol.asyncDispose]() {
            await Promise.resolve();
        },
    };
    await using cache = createAggregateCacheAdapter(createLruMemoryCacheAdapter(32), failing);
    await expect(cache.write("key", new Blob())).rejects.toMatchObject({ errors: [error] });
    expect(records).toContainEqual(
        expect.objectContaining({
            level: "warning",
            properties: { operation: "Aggregate cache write failed.", failed: 1, total: 2 },
        }),
    );
    expect(records).toContainEqual(
        expect.objectContaining({ level: "error", category: ["whiteeclipse", "cache", "aggregate"] }),
    );
});

it("logs cleanup failures once even when disposal is repeated", async () => {
    const error = new Error("synthetic cleanup failure");
    const queue = createCacheOperationQueue("test", async () => {
        await Promise.resolve();
        throw error;
    });
    await expect(queue[Symbol.asyncDispose]()).rejects.toBe(error);
    await expect(queue[Symbol.asyncDispose]()).rejects.toBe(error);
    expect(records.filter(record => record.level === "error")).toEqual([
        expect.objectContaining({ properties: { error }, rawMessage: "Cache disposal failed." }),
    ]);
});

it("logs initialization failures at error level", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(createIndexedDbCacheAdapter(databaseName)).rejects.toThrow("unavailable");
    expect(records).toContainEqual(
        expect.objectContaining({ level: "error", rawMessage: "Cannot open IndexedDB cache." }),
    );
});
