/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { makeLogConfigurationBuilder } from "@whiteeclipse/log";
import { createOperationQueue } from "./index.ts";


/** Captured queue log records. */
interface RecordedLog {
    level: string;
    rawMessage: string | TemplateStringsArray;
    properties: Readonly<Record<string, unknown>>;
}

const records: RecordedLog[] = [];
let logging: AsyncDisposable;

beforeEach(async () => {
    records.length = 0;
    logging = await makeLogConfigurationBuilder()
        .withSink({
            name: "capture",
            build: () => record => {
                records.push(record);
            },
        })
        .withLogger({ category: ["whiteeclipse", "async-queue"], sinks: ["capture"], lowestLevel: "trace" })
        .apply();
});

afterEach(async () => {
    await logging[Symbol.asyncDispose]();
});

it("traces queued, started, and completed actions without recording results", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = createOperationQueue(cleanup);
    expect(await queue.run(() => "synthetic-private-result")).toBe("synthetic-private-result");
    await queue[Symbol.asyncDispose]();
    await queue[Symbol.asyncDispose]();
    const trace = records.filter(record => record.level === "trace");
    expect(trace.map(record => record.rawMessage)).toEqual([
        "Queued action.",
        "Starting queued action.",
        "Completed queued action.",
    ]);
    const queueId = trace[0]?.properties["queueId"];
    expect(queueId).toBeTypeOf("number");
    expect(trace.map(record => record.properties)).toEqual([
        { queueId, operationId: 1 },
        { queueId, operationId: 1 },
        { queueId, operationId: 1 },
    ]);
    expect(trace.every(record => record.properties["queueId"] === queueId)).toBe(true);
    expect(records.filter(record => record.rawMessage === "Disposed operation queue.")).toHaveLength(1);
    expect(JSON.stringify(records)).not.toContain("synthetic-private-result");
});

it("does not log a waiting action as started before its predecessor completes", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    await using queue = createOperationQueue(cleanup);
    const gate = Promise.withResolvers<undefined>();
    const started = Promise.withResolvers<undefined>();
    const first = queue.run(async () => {
        started.resolve(undefined);
        await gate.promise;
    });
    const second = queue.run(() => "second");
    await started.promise;
    expect(records.filter(record => record.rawMessage === "Starting queued action.")).toHaveLength(1);
    gate.resolve(undefined);
    await Promise.all([first, second]);
    expect(records.filter(record => record.rawMessage === "Starting queued action.")).toHaveLength(2);
});

it("logs original action errors without preventing later actions", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    await using queue = createOperationQueue(cleanup);
    const failure = new Error("synthetic failure");
    await expect(
        queue.run(() => {
            throw failure;
        }),
    ).rejects.toBe(failure);
    const rejected = Promise.withResolvers<undefined>();
    rejected.reject("synthetic rejection");
    await expect(queue.run(async () => rejected.promise)).rejects.toBe("synthetic rejection");
    expect(await queue.run(() => "recovered")).toBe("recovered");
    const queueId = records[0]?.properties["queueId"];
    expect(records.filter(record => record.level === "error")).toEqual([
        expect.objectContaining({ properties: { queueId, operationId: 1, error: failure } }),
        expect.objectContaining({
            properties: { queueId, operationId: 2, error: "synthetic rejection" },
        }),
    ]);
});

it("warns about admission after disposal without invoking the action", async () => {
    const cleanup = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = createOperationQueue(cleanup);
    await queue[Symbol.asyncDispose]();
    const action = vi.fn();
    await expect(queue.run(action)).rejects.toThrow("disposed");
    expect(action).not.toHaveBeenCalled();
    expect(records.filter(record => record.level === "warning")).toHaveLength(1);
    expect(records.filter(record => record.level === "error")).toHaveLength(0);
});

it("logs cleanup failure once and preserves repeated disposal failures", async () => {
    const failure = new Error("synthetic cleanup failure");
    const cleanup = vi.fn<() => Promise<void>>().mockRejectedValue(failure);
    const queue = createOperationQueue(cleanup);
    await expect(queue[Symbol.asyncDispose]()).rejects.toBe(failure);
    await expect(queue[Symbol.asyncDispose]()).rejects.toBe(failure);
    expect(cleanup).toHaveBeenCalledOnce();
    const queueId = records[0]?.properties["queueId"];
    expect(records.filter(record => record.level === "error")).toEqual([
        expect.objectContaining({
            rawMessage: "Operation queue cleanup failed.",
            properties: { queueId, error: failure },
        }),
    ]);
});
