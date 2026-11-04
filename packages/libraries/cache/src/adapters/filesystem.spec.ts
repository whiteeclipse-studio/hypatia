/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { access, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, it } from "vitest";
import { createFileSystemCacheAdapter, type FileSystemCacheAdapter } from "@whiteeclipse/cache/filesystem";


/**
 * Reads a required fixture entry.
 *
 * @param cache Adapter under test.
 * @param key Fixture key.
 * @returns The cached Blob.
 * @rejects If reading fails or the entry is absent.
 */
async function readBlob(cache: FileSystemCacheAdapter, key: string): Promise<Blob> {
    const blob = await cache.read(key);
    if (blob === undefined) {
        throw new Error("Expected a cached Blob.");
    }
    return blob;
}

it("stores Blob bytes and MIME types under opaque keys", async () => {
    await using cache = await createFileSystemCacheAdapter();
    const key = "../../outside/資料";
    expect(await cache.read(key)).toBeUndefined();
    await cache.remove(key);
    const original = new Blob(["資料 — Français"], { type: "text/plain" });
    await cache.write(key, original);
    const blob = await readBlob(cache, key);
    expect(blob.type).toBe(original.type);
    expect(await blob.text()).toBe("資料 — Français");
    expect(await readdir(cache.directory)).toHaveLength(1);
});

it("replaces and removes entries without retaining old files", async () => {
    await using cache = await createFileSystemCacheAdapter();
    await cache.write("key", new Blob(["old"]));
    await cache.write("key", new Blob(["new"]));
    expect(await (await readBlob(cache, "key")).text()).toBe("new");
    expect(await readdir(cache.directory)).toHaveLength(1);
    await cache.remove("key");
    expect(await cache.read("key")).toBeUndefined();
    expect(await readdir(cache.directory)).toHaveLength(0);
});

it("preserves the previous entry and cleans up an unreadable Blob's partial write", async () => {
    await using cache = await createFileSystemCacheAdapter();
    await cache.write("destination", new Blob(["old"]));
    await cache.write("source", new Blob(["source"]));
    const invalidated = await readBlob(cache, "source");
    await cache.remove("source");
    await expect(cache.write("destination", invalidated)).rejects.toThrow();
    expect(await (await readBlob(cache, "destination")).text()).toBe("old");
    expect(await readdir(cache.directory)).toHaveLength(1);
});

it("serializes overlapping calls in invocation order", async () => {
    await using cache = await createFileSystemCacheAdapter();
    const first = cache.write("key", new Blob(["first"]));
    const reading = cache.read("key");
    // Consume the borrowed Blob before allowing a destructive operation.
    await first;
    expect(await (await reading)?.text()).toBe("first");
    const replacement = cache.write("key", new Blob(["second"]));
    const removing = cache.remove("key");
    await Promise.all([replacement, removing]);
    expect(await cache.read("key")).toBeUndefined();
});

it("drains admitted calls before deletion without waiting for borrowed Blobs", async () => {
    const cache = await createFileSystemCacheAdapter();
    await cache.write("borrowed", new Blob(["contents"]));
    const borrowed = await readBlob(cache, "borrowed");
    const writing = cache.write("pending", new Blob(["x".repeat(200_000)]));
    const removing = cache.remove("borrowed");
    const disposing = cache[Symbol.asyncDispose]();
    const repeated = cache[Symbol.asyncDispose]();
    await expect(cache.read("key")).rejects.toThrow("disposed");
    await expect(cache.write("key", new Blob())).rejects.toThrow("disposed");
    await expect(cache.remove("key")).rejects.toThrow("disposed");
    await Promise.all([writing, removing, disposing, repeated]);
    expect(borrowed.size).toBeGreaterThan(0);
    await expect(access(cache.directory)).rejects.toMatchObject({ code: "ENOENT" });
    await cache[Symbol.asyncDispose]();
});

it("handles empty and multi-chunk assets", async () => {
    await using cache = await createFileSystemCacheAdapter();
    const value = "資料".repeat(100_000);
    await cache.write("large", new Blob([value]));
    await cache.write("empty", new Blob());
    expect(await (await readBlob(cache, "large")).text()).toBe(value);
    expect((await readBlob(cache, "empty")).size).toBe(0);
});

it("treats missing files as misses", async () => {
    await using cache = await createFileSystemCacheAdapter();
    await cache.write("key", new Blob(["contents"]));
    for (const filename of await readdir(cache.directory)) {
        await rm(join(cache.directory, filename));
    }
    expect(await cache.read("key")).toBeUndefined();
    await cache.remove("key");
});

it("propagates filesystem errors without poisoning the operation queue", async () => {
    await using cache = await createFileSystemCacheAdapter();
    await cache.write("key", new Blob(["contents"]));
    const moved = `${cache.directory}-moved`;
    await rename(cache.directory, moved);
    try {
        await writeFile(cache.directory, "not a directory");
        await expect(cache.read("key")).rejects.toThrow();
        await expect(cache.remove("key")).rejects.toThrow();
    } finally {
        await rm(cache.directory, { force: true });
        await rename(moved, cache.directory);
    }
    expect(await (await readBlob(cache, "key")).text()).toBe("contents");
});
