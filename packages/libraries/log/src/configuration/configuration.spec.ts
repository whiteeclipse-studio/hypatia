/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { getLogger, reset, type Sink } from "@logtape/logtape";
import { makeLogConfigurationBuilder } from "../index";


afterEach(async () => {
    await reset();
});

describe("configuration builder", () => {
    it("keeps branches immutable and routes through typed sinks and filters", async () => {
        const records = vi.fn<Sink>();
        const base = makeLogConfigurationBuilder().withSink({ name: "capture", build: () => records });
        const branch = base.withFilter({ name: "exclude", build: () => () => false });
        const first = await branch.withLogger({ category: "test", sinks: ["capture"], filters: ["exclude"] }).apply();
        getLogger("test").info("excluded");
        expect(records).not.toHaveBeenCalled();
        await first[Symbol.asyncDispose]();
        await using _second = await base.withLogger({ category: "test", sinks: ["capture"] }).apply();
        expect(_second).toBeDefined();
        getLogger("test").info("included");
        expect(records).toHaveBeenCalledOnce();
        expectTypeOf<Parameters<typeof base.withLogger>[0]["sinks"]>().toEqualTypeOf<"capture"[] | undefined>();
        expect(() => base.withSink({ name: "capture", build: () => records })).toThrow("already exists");
        expect(() => branch.withFilter({ name: "exclude", build: () => () => true })).toThrow("already exists");
    });

    it("cleans up acquired sinks when a filter factory fails", async () => {
        const cleanup = vi.fn();
        const sink = Object.assign(vi.fn<Sink>(), { [Symbol.dispose]: cleanup });
        const failure = new Error("filter failed");
        await expect(
            makeLogConfigurationBuilder()
                .withSink({ name: "capture", build: () => sink })
                .withFilter({
                    name: "broken",
                    build() {
                        throw failure;
                    },
                })
                .apply(),
        ).rejects.toBe(failure);
        expect(cleanup).toHaveBeenCalledOnce();
    });

    it("cleans up invalid configurations and leaves an active configuration intact", async () => {
        const active = vi.fn<Sink>();
        const disposeActive = vi.fn();
        const disposeRejected = vi.fn();
        const builder = makeLogConfigurationBuilder().withSink({
            name: "capture",
            build: () => Object.assign(active, { [Symbol.dispose]: disposeActive }),
        });
        await using _handle = await builder.withLogger({ category: "test", sinks: ["capture"] }).apply();
        await expect(
            makeLogConfigurationBuilder()
                .withSink({
                    name: "other",
                    build: () => Object.assign(vi.fn<Sink>(), { [Symbol.dispose]: disposeRejected }),
                })
                .apply(),
        ).rejects.toThrow("Already configured");
        expect(_handle).toBeDefined();
        getLogger("test").info("still active");
        expect(active).toHaveBeenCalledOnce();
        expect(disposeActive).not.toHaveBeenCalled();
        expect(disposeRejected).toHaveBeenCalledOnce();
    });

    it("disposes once and prevents an old handle from resetting a newer configuration", async () => {
        const cleanup = vi.fn();
        const builder = makeLogConfigurationBuilder().withSink({
            name: "capture",
            build: () => Object.assign(vi.fn<Sink>(), { [Symbol.asyncDispose]: cleanup }),
        });
        const first = await builder.apply();
        await reset();
        const output = vi.fn<Sink>();
        await using _second = await makeLogConfigurationBuilder()
            .withSink({ name: "new", build: () => output })
            .withLogger({ category: "test", sinks: ["new"] })
            .apply();
        await first[Symbol.asyncDispose]();
        await first[Symbol.asyncDispose]();
        expect(_second).toBeDefined();
        getLogger("test").info("new configuration");
        expect(output).toHaveBeenCalledOnce();
        expect(cleanup).toHaveBeenCalledOnce();
    });

    it("releases sinks when logger validation fails", async () => {
        const cleanup = vi.fn();
        const builder = makeLogConfigurationBuilder().withSink({
            name: "capture",
            build: () => Object.assign(vi.fn<Sink>(), { [Symbol.dispose]: cleanup }),
        });
        const logger = { category: "duplicate", sinks: ["capture" as const] };
        await expect(builder.withLogger(logger).withLogger(logger).apply()).rejects.toThrow("Duplicate");
        expect(cleanup).toHaveBeenCalledOnce();
    });
});
