/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import "fake-indexeddb/auto";
import { deleteDB, openDB } from "idb";
import { afterEach, expect, it, vi } from "vitest";
import { createIndexedDbCacheAdapter } from "@whiteeclipse/cache/indexeddb";


const databases = new Set<string>();

afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await Promise.all([...databases].map(async name => deleteDB(name)));
    databases.clear();
});

/**
 * Registers a database for test cleanup.
 *
 * @returns A unique database name.
 */
function databaseName(): string {
    const name = `hypatia-cache-test-${crypto.randomUUID()}`;
    databases.add(name);
    return name;
}

it("stores and retrieves independent Blobs, preserving bytes and MIME types", async () => {
    await using cache = await createIndexedDbCacheAdapter(databaseName());
    const key = "../../資料";
    const original = new Blob(["資料 — Français"], { type: "text/plain" });
    expect(await cache.read(key)).toBeUndefined();
    await cache.write(key, original);
    const stored = await cache.read(key);
    expect(stored).not.toBe(original);
    expect(stored?.type).toBe(original.type);
    expect(await stored?.text()).toBe("資料 — Français");
    await cache.write("empty", new Blob());
    expect((await cache.read("empty"))?.size).toBe(0);
});

it("replaces and removes keys, including absent keys", async () => {
    await using cache = await createIndexedDbCacheAdapter(databaseName());
    await cache.write("key", new Blob(["old"]));
    await cache.write("key", new Blob(["new"]));
    expect(await (await cache.read("key"))?.text()).toBe("new");
    await cache.remove("missing");
    await cache.remove("key");
    expect(await cache.read("key")).toBeUndefined();
});

it("persists committed writes across disposal and reopening", async () => {
    const name = databaseName();
    const first = await createIndexedDbCacheAdapter(name);
    await first.write("key", new Blob(["persistent"]));
    await first[Symbol.asyncDispose]();
    await using second = await createIndexedDbCacheAdapter(name);
    expect(await (await second.read("key"))?.text()).toBe("persistent");
});

it("drains writes and deletes a temporary database once on disposal", async () => {
    const name = databaseName();
    const deletion = vi.spyOn(indexedDB, "deleteDatabase");
    const cache = await createIndexedDbCacheAdapter(name, { deleteOnDispose: true });
    const writing = cache.write("key", new Blob(["temporary"]));
    const disposing = cache[Symbol.asyncDispose]();
    const repeated = cache[Symbol.asyncDispose]();
    await expect(cache.read("key")).rejects.toThrow("disposed");
    await Promise.all([writing, disposing, repeated]);
    expect(deletion).toHaveBeenCalledExactlyOnceWith(name);
    expect((await indexedDB.databases()).some(database => database.name === name)).toBe(false);
    await using reopened = await createIndexedDbCacheAdapter(name);
    expect(await reopened.read("key")).toBeUndefined();
});

it("reports deletion blocked by another connection and preserves the disposal failure", async () => {
    const name = databaseName();
    const cache = await createIndexedDbCacheAdapter(name, { deleteOnDispose: true });
    const blocker = await openDB(name, 1);
    try {
        await expect(cache[Symbol.asyncDispose]()).rejects.toThrow("blocked by another connection");
        await expect(cache[Symbol.asyncDispose]()).rejects.toThrow("blocked by another connection");
    } finally {
        blocker.close();
        await deleteDB(name);
    }
});

it("isolates named databases while allowing same-name connections to share committed data", async () => {
    const name = databaseName();
    await using first = await createIndexedDbCacheAdapter(name);
    await using shared = await createIndexedDbCacheAdapter(name);
    await using other = await createIndexedDbCacheAdapter(databaseName());
    await first.write("key", new Blob(["shared"]));
    expect(await (await shared.read("key"))?.text()).toBe("shared");
    expect(await other.read("key")).toBeUndefined();
});

it("drains admitted writes before closing and rejects new operations", async () => {
    const name = databaseName();
    const cache = await createIndexedDbCacheAdapter(name);
    const writing = cache.write("key", new Blob(["committed before close"]));
    const disposing = cache[Symbol.asyncDispose]();
    const repeated = cache[Symbol.asyncDispose]();
    await expect(cache.read("key")).rejects.toThrow("disposed");
    await expect(cache.write("key", new Blob())).rejects.toThrow("disposed");
    await expect(cache.remove("key")).rejects.toThrow("disposed");
    await Promise.all([writing, disposing, repeated]);
    await using reopened = await createIndexedDbCacheAdapter(name);
    expect(await (await reopened.read("key"))?.text()).toBe("committed before close");
});

it("rejects unavailable IndexedDB without installing an in-memory runtime fallback", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(createIndexedDbCacheAdapter("unavailable")).rejects.toThrow("unavailable");
});

it("rejects incompatible schema versions without overwriting stored data", async () => {
    const name = databaseName();
    const raw = await openDB(name, 2, {
        /**
         * Creates an incompatible schema fixture.
         *
         * @param db Fixture database.
         */
        upgrade(db) {
            db.createObjectStore("other");
        },
    });
    raw.close();
    await expect(createIndexedDbCacheAdapter(name)).rejects.toMatchObject({ name: "VersionError" });
});

it("rejects missing stores and malformed cached values", async () => {
    const name = databaseName();
    const raw = await openDB(name, 1);
    raw.close();
    await expect(createIndexedDbCacheAdapter(name)).rejects.toThrow("entries store");
    const validName = databaseName();
    await using cache = await createIndexedDbCacheAdapter(validName);
    const connection = await openDB(validName, 1);
    try {
        await connection.put("entries", "not a Blob", "key");
        await expect(cache.read("key")).rejects.toThrow(TypeError);
        await cache.remove("key");
        expect(await cache.read("key")).toBeUndefined();
    } finally {
        connection.close();
    }
});

it("closes connections to allow another client to upgrade the database", async () => {
    const name = databaseName();
    await using cache = await createIndexedDbCacheAdapter(name);
    const upgraded = await openDB(name, 2);
    upgraded.close();
    await expect(cache.read("key")).rejects.toMatchObject({ name: "InvalidStateError" });
});

it("preserves the previous value after an aborted write transaction and recovers", async () => {
    await using cache = await createIndexedDbCacheAdapter(databaseName());
    await cache.write("key", new Blob(["old"]));
    vi.spyOn(IDBObjectStore.prototype, "put").mockImplementationOnce(function abortingPut(
        this: IDBObjectStore,
        value: unknown,
        key?: IDBValidKey,
    ) {
        const request = this.add(value, key);
        this.transaction.abort();
        return request;
    });
    await expect(cache.write("key", new Blob(["new"]))).rejects.toMatchObject({ name: "AbortError" });
    expect(await (await cache.read("key"))?.text()).toBe("old");
    await cache.write("key", new Blob(["recovered"]));
    expect(await (await cache.read("key"))?.text()).toBe("recovered");
});
