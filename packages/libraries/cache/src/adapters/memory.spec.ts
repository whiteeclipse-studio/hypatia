/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it, vi } from "vitest";
import { createFileSystemCacheAdapter } from "@whiteeclipse/cache/filesystem";
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";


it("stores independent Blobs with their bytes and MIME type", async () => {
    await using cache = createLruMemoryCacheAdapter(100);
    const original = new Blob(["資料"], { type: "text/plain" });
    expect(await cache.read("missing")).toBeUndefined();
    await cache.write("../../key", original);
    const stored = await cache.read("../../key");
    expect(stored).not.toBe(original);
    expect(stored?.type).toBe(original.type);
    expect(await stored?.text()).toBe("資料");
});

it("evicts the least recently read entry at capacity", async () => {
    await using cache = createLruMemoryCacheAdapter(2);
    await cache.write("a", new Blob(["a"]));
    await cache.write("b", new Blob(["b"]));
    await cache.read("a");
    await cache.write("c", new Blob(["c"]));
    expect(await cache.read("b")).toBeUndefined();
    expect(await (await cache.read("a"))?.text()).toBe("a");
    expect(await (await cache.read("c"))?.text()).toBe("c");
});

it("refreshes recency on replacement and frees the previous size", async () => {
    await using cache = createLruMemoryCacheAdapter(4);
    await cache.write("a", new Blob(["aa"]));
    await cache.write("b", new Blob(["bb"]));
    await cache.write("a", new Blob(["a"]));
    await cache.write("c", new Blob(["c"]));
    expect(await cache.read("b")).toBeDefined();
    await cache.write("d", new Blob(["d"]));
    // The read above refreshed b, leaving a as the oldest entry.
    expect(await cache.read("a")).toBeUndefined();
    expect(await cache.read("c")).toBeDefined();
});

it("evicts multiple entries to fit a larger Blob", async () => {
    await using cache = createLruMemoryCacheAdapter(4);
    await cache.write("a", new Blob(["aa"]));
    await cache.write("b", new Blob(["bb"]));
    await cache.write("c", new Blob(["ccc"]));
    expect(await cache.read("a")).toBeUndefined();
    expect(await cache.read("b")).toBeUndefined();
    expect(await cache.read("c")).toBeDefined();
});

it("removes stale values for oversized writes without evicting unrelated entries", async () => {
    await using cache = createLruMemoryCacheAdapter(2);
    await cache.write("a", new Blob(["a"]));
    await cache.write("b", new Blob(["b"]));
    await cache.write("a", new Blob(["too large"]));
    expect(await cache.read("a")).toBeUndefined();
    expect(await cache.read("b")).toBeDefined();
});

it("supports zero capacity and bounds empty Blobs", async () => {
    await using disabled = createLruMemoryCacheAdapter(0);
    await disabled.write("empty", new Blob());
    expect(await disabled.read("empty")).toBeUndefined();
    await using cache = createLruMemoryCacheAdapter(1);
    await cache.write("first", new Blob());
    await cache.write("second", new Blob());
    expect(await cache.read("first")).toBeUndefined();
    expect((await cache.read("second"))?.size).toBe(0);
});

it("reclaims capacity after removal and ignores missing removals and reads", async () => {
    await using cache = createLruMemoryCacheAdapter(2);
    await cache.write("a", new Blob(["a"]));
    await cache.write("b", new Blob(["b"]));
    await cache.remove("a");
    await cache.remove("missing");
    await cache.read("missing");
    await cache.write("c", new Blob(["c"]));
    expect(await cache.read("b")).toBeDefined();
    expect(await cache.read("c")).toBeDefined();
});

it("preserves existing entries if materializing a Blob fails", async () => {
    await using cache = createLruMemoryCacheAdapter(2);
    const blob = new Blob(["b"]);
    const failure = new Error("Unreadable Blob.");
    vi.spyOn(blob, "arrayBuffer").mockRejectedValue(failure);
    await cache.write("key", new Blob(["a"]));
    await expect(cache.write("key", blob)).rejects.toBe(failure);
    expect(await (await cache.read("key"))?.text()).toBe("a");
});

it("owns its bytes independently of a source filesystem cache", async () => {
    await using disk = await createFileSystemCacheAdapter();
    await using memory = createLruMemoryCacheAdapter(10);
    await disk.write("key", new Blob(["contents"]));
    const source = await disk.read("key");
    if (source === undefined) {
        throw new Error("Expected fixture Blob.");
    }
    await memory.write("key", source);
    await disk.remove("key");
    expect(await (await memory.read("key"))?.text()).toBe("contents");
});

it("drains accepted writes on disposal and rejects subsequent operations", async () => {
    const cache = createLruMemoryCacheAdapter(2);
    const blob = new Blob(["a"]);
    const gate = Promise.withResolvers<ArrayBuffer>();
    vi.spyOn(blob, "arrayBuffer").mockReturnValue(gate.promise);
    const writing = cache.write("key", blob);
    const disposing = cache[Symbol.asyncDispose]();
    await expect(cache.read("key")).rejects.toThrow("disposed");
    await expect(cache.write("key", blob)).rejects.toThrow("disposed");
    await expect(cache.remove("key")).rejects.toThrow("disposed");
    gate.resolve(new Uint8Array([97]).buffer);
    await Promise.all([writing, disposing]);
    await cache[Symbol.asyncDispose]();
});

it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid budgets: %s", budget => {
    expect(() => createLruMemoryCacheAdapter(budget)).toThrow(RangeError);
});

it("makes a replacement the most recently used entry", async () => {
    await using cache = createLruMemoryCacheAdapter(2);
    await cache.write("a", new Blob(["a"]));
    await cache.write("b", new Blob(["b"]));
    await cache.write("a", new Blob(["A"]));
    await cache.write("c", new Blob(["c"]));
    expect(await cache.read("b")).toBeUndefined();
    expect(await (await cache.read("a"))?.text()).toBe("A");
});
