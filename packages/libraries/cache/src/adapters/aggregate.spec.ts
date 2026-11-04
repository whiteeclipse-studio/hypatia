/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, expectTypeOf, it, vi } from "vitest";
import type { CacheAdapter } from "../types.ts";
import { createAggregateCacheAdapter } from "./aggregate";


/**
 * Creates a stub cache.
 *
 * @returns Spies for each operation.
 */
function child() {
    return {
        read: vi.fn<CacheAdapter["read"]>().mockResolvedValue(undefined),
        write: vi.fn<CacheAdapter["write"]>().mockResolvedValue(undefined),
        remove: vi.fn<CacheAdapter["remove"]>().mockResolvedValue(undefined),
        [Symbol.asyncDispose]: vi.fn<CacheAdapter[typeof Symbol.asyncDispose]>().mockResolvedValue(undefined),
    };
}

it("reads in priority order, returns the first hit, and does not populate earlier caches", async () => {
    const first = child();
    const second = child();
    const third = child();
    const blob = new Blob(["contents"]);
    second.read.mockResolvedValue(blob);
    await using cache = createAggregateCacheAdapter(first, second, third);

    expect(await cache.read("key")).toBe(blob);
    expect(first.read).toHaveBeenCalledWith("key");
    expect(second.read).toHaveBeenCalledWith("key");
    expect(first.read.mock.invocationCallOrder[0]).toBeLessThan(second.read.mock.invocationCallOrder[0] ?? Infinity);
    expect(third.read).not.toHaveBeenCalled();
    expect(first.write).not.toHaveBeenCalled();
    expectTypeOf(cache.adapters).toEqualTypeOf<readonly [typeof first, typeof second, typeof third]>();
});

it("returns undefined only after every child misses and accepts empty Blobs as hits", async () => {
    const first = child();
    const second = child();
    await using cache = createAggregateCacheAdapter(first, second);
    expect(await cache.read("missing")).toBeUndefined();
    expect(second.read).toHaveBeenCalledWith("missing");
    const empty = new Blob();
    first.read.mockResolvedValue(empty);
    expect(await cache.read("empty")).toBe(empty);
    expect(second.read).toHaveBeenCalledTimes(1);
});

it("propagates read errors without treating them as misses, then accepts later operations", async () => {
    const first = child();
    const second = child();
    const failure = new Error("Read failed.");
    first.read.mockRejectedValueOnce(failure);
    await using cache = createAggregateCacheAdapter(first, second);
    await expect(cache.read("key")).rejects.toBe(failure);
    expect(second.read).not.toHaveBeenCalled();
    expect(await cache.read("key")).toBeUndefined();
    expect(second.read).toHaveBeenCalledTimes(1);
});

it("replicates the same Blob and key to all children", async () => {
    const first = child();
    const second = child();
    const blob = new Blob(["contents"], { type: "text/plain" });
    await using cache = createAggregateCacheAdapter(first, second);
    await cache.write("key", blob);
    await cache.remove("key");
    for (const adapter of [first, second]) {
        expect(adapter.write).toHaveBeenCalledExactlyOnceWith("key", blob);
        expect(adapter.remove).toHaveBeenCalledExactlyOnceWith("key");
    }
});

it.each(["write", "remove"] as const)("waits for every %s result and preserves all failures", async method => {
    const first = child();
    const second = child();
    const third = child();
    const failure = new Error("Synchronous failure.");
    const pending = Promise.withResolvers<undefined>();
    const started = Promise.withResolvers<undefined>();
    first[method].mockImplementation(() => {
        throw failure;
    });
    second[method].mockImplementation(async () => {
        started.resolve(undefined);
        return pending.promise;
    });
    third[method].mockRejectedValue("non-Error rejection");
    await using cache = createAggregateCacheAdapter(first, second, third);
    const result = method === "write" ? cache.write("key", new Blob()) : cache.remove("key");
    const rejection = expect(result).rejects.toMatchObject({ errors: [failure, "non-Error rejection"] });
    let settled = false;
    void result.then(
        () => {
            settled = true;
        },
        () => {
            settled = true;
        },
    );
    await started.promise;
    expect(settled).toBe(false);
    expect(third[method]).toHaveBeenCalledTimes(1);
    pending.resolve(undefined);
    await rejection;
    expect(await cache.read("other")).toBeUndefined();
});

it("handles an empty aggregate and rejects operations after disposal", async () => {
    const cache = createAggregateCacheAdapter();
    expect(await cache.read("key")).toBeUndefined();
    await cache.write("key", new Blob());
    await cache.remove("key");
    await cache[Symbol.asyncDispose]();
    await expect(cache.read("key")).rejects.toThrow("disposed");
    await expect(cache.write("key", new Blob())).rejects.toThrow("disposed");
    await expect(cache.remove("key")).rejects.toThrow("disposed");
    await cache[Symbol.asyncDispose]();
});

it("drains admitted reads before disposing children and rejects new calls immediately", async () => {
    const adapter = child();
    const reading = Promise.withResolvers<Blob | undefined>();
    const started = Promise.withResolvers<undefined>();
    adapter.read.mockImplementation(async () => {
        started.resolve(undefined);
        return reading.promise;
    });
    const cache = createAggregateCacheAdapter(adapter);
    const result = cache.read("key");
    await started.promise;
    const disposal = cache[Symbol.asyncDispose]();
    const repeated = cache[Symbol.asyncDispose]();
    await expect(cache.read("later")).rejects.toThrow("disposed");
    await expect(cache.write("later", new Blob())).rejects.toThrow("disposed");
    await expect(cache.remove("later")).rejects.toThrow("disposed");
    expect(adapter[Symbol.asyncDispose]).not.toHaveBeenCalled();
    reading.resolve(undefined);
    await result;
    await Promise.all([disposal, repeated]);
    expect(adapter[Symbol.asyncDispose]).toHaveBeenCalledTimes(1);
});

it("disposes every distinct child once, waits for cleanup, and repeats the same failure", async () => {
    const first = child();
    const second = child();
    const third = child();
    const failure = new Error("Synchronous cleanup failure.");
    const pending = Promise.withResolvers<undefined>();
    const started = Promise.withResolvers<undefined>();
    first[Symbol.asyncDispose].mockImplementation(() => {
        throw failure;
    });
    second[Symbol.asyncDispose].mockImplementation(async () => {
        started.resolve(undefined);
        return pending.promise;
    });
    third[Symbol.asyncDispose].mockRejectedValue("cleanup rejection");
    const cache = createAggregateCacheAdapter(first, second, first, third);
    const disposal = cache[Symbol.asyncDispose]();
    const rejection = expect(disposal).rejects.toMatchObject({
        errors: [failure, "late cleanup failure", "cleanup rejection"],
    });
    await started.promise;
    pending.reject("late cleanup failure");
    await rejection;
    await expect(cache[Symbol.asyncDispose]()).rejects.toMatchObject({
        errors: [failure, "late cleanup failure", "cleanup rejection"],
    });
    for (const adapter of [first, second, third]) {
        expect(adapter[Symbol.asyncDispose]).toHaveBeenCalledTimes(1);
    }
});

it("attempts each distinct child once and does not roll back partial replication", async () => {
    const first = child();
    const second = child();
    const failure = new Error("Backend write failed.");
    second.write.mockRejectedValue(failure);
    await using cache = createAggregateCacheAdapter(first, first, second);
    await expect(cache.write("key", new Blob())).rejects.toMatchObject({ errors: [failure] });
    expect(first.write).toHaveBeenCalledTimes(1);
    expect(second.write).toHaveBeenCalledTimes(1);
    expect(first.remove).not.toHaveBeenCalled();
});
