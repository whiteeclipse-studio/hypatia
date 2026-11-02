/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, expectTypeOf, it, vi } from "vitest";
import { createOperationQueue } from "./index.ts";


it("runs actions in order and preserves inferred return values", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    await using queue = createOperationQueue(cleanup);
    const gate = Promise.withResolvers<number>();
    const second = vi.fn(() => "second");
    const firstResult = queue.run(async () => gate.promise);
    const secondResult = queue.run(second);
    expect(second).not.toHaveBeenCalled();
    gate.resolve(42);
    expect(await firstResult).toBe(42);
    expect(await secondResult).toBe("second");
    expectTypeOf(firstResult).toEqualTypeOf<Promise<number>>();
    expectTypeOf(secondResult).toEqualTypeOf<Promise<string>>();
});

it("preserves synchronous and asynchronous failures without poisoning the queue", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = createOperationQueue(cleanup);
    const error = new Error("Synchronous failure.");
    await expect(
        queue.run(() => {
            throw error;
        }),
    ).rejects.toBe(error);
    await expect(queue.run(async () => Promise.reject(error))).rejects.toBe(error);
    expect(await queue.run(() => "recovered")).toBe("recovered");
    await queue[Symbol.asyncDispose]();
    expect(cleanup).toHaveBeenCalledTimes(1);
});

it("stops admission immediately, drains queued actions, and only then cleans up", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = createOperationQueue(cleanup);
    const gate = Promise.withResolvers<undefined>();
    const first = queue.run(async () => gate.promise);
    const secondAction = vi.fn(() => "queued");
    const second = queue.run(secondAction);
    const disposing = queue[Symbol.asyncDispose]();
    const repeated = queue[Symbol.asyncDispose]();
    const rejectedAction = vi.fn();
    await expect(queue.run(rejectedAction)).rejects.toThrow("disposed");
    expect(rejectedAction).not.toHaveBeenCalled();
    expect(cleanup).not.toHaveBeenCalled();
    gate.resolve(undefined);
    await Promise.all([first, second, disposing, repeated]);
    expect(secondAction).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
});

it("waits for a failing admitted action before cleanup", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = createOperationQueue(cleanup);
    const gate = Promise.withResolvers<undefined>();
    const result = queue.run(async () => gate.promise);
    const rejected = expect(result).rejects.toBe("late failure");
    const disposing = queue[Symbol.asyncDispose]();
    expect(cleanup).not.toHaveBeenCalled();
    gate.reject("late failure");
    await rejected;
    await disposing;
    expect(cleanup).toHaveBeenCalledTimes(1);
});

it("joins pending cleanup and preserves its failure on repeated disposal", async () => {
    const gate = Promise.withResolvers<undefined>();
    const started = Promise.withResolvers<undefined>();
    const cleanup = vi.fn(async () => {
        started.resolve(undefined);
        return gate.promise;
    });
    const queue = createOperationQueue(cleanup);
    const first = queue[Symbol.asyncDispose]();
    const second = queue[Symbol.asyncDispose]();
    const failure = new Error("Cleanup failed.");
    const failures = Promise.all([expect(first).rejects.toBe(failure), expect(second).rejects.toBe(failure)]);
    await started.promise;
    expect(cleanup).toHaveBeenCalledTimes(1);
    gate.reject(failure);
    await failures;
    await expect(queue[Symbol.asyncDispose]()).rejects.toBe(failure);
    expect(cleanup).toHaveBeenCalledTimes(1);
});
