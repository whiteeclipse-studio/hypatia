/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogger, reset } from "@logtape/logtape";
import { makeDefaultLogConfigurationBuilder, makeLogConfigurationBuilder } from "../index.js";
import { makeLogConsoleSinkFactory, makeLogJSONSinkFactory } from "./factory/sink/index.js";


beforeEach(() => {
    vi.stubEnv("LOG_LEVEL", undefined);
});

afterEach(async () => {
    vi.unstubAllEnvs();
    await reset();
});

describe("sink factories", () => {
    it("flushes JSON on disposal with immutable formatter options", async () => {
        const info = vi.fn<Console["info"]>();
        const factory = makeLogJSONSinkFactory({ ...console, info }).withMessage("rendered");
        await using handle = await makeLogConfigurationBuilder()
            .withSink(factory)
            .withLogger({ category: "test", sinks: ["json"] })
            .apply();
        getLogger("test").info("Hello {name}", { name: "world" });
        await handle[Symbol.asyncDispose]();
        expect(info).toHaveBeenCalledOnce();
        expect(JSON.parse(String(info.mock.calls[0]?.[0]))).toMatchObject({ message: 'Hello "world"' });
    });

    it("supports immutable pretty formatter setters and flushes console output", async () => {
        const info = vi.fn<Console["info"]>();
        const base = makeLogConsoleSinkFactory({ ...console, info });
        const factory = base.withColors(false).withTimestamp("none");
        expect(factory).not.toBe(base);
        await using handle = await makeLogConfigurationBuilder()
            .withSink(factory)
            .withLogger({ category: "test", sinks: ["console"] })
            .apply();
        getLogger("test").info("pretty message");
        await handle[Symbol.asyncDispose]();
        expect(info).toHaveBeenCalledOnce();
        expect(info.mock.calls.flat().join(" ")).toContain("pretty message");
    });

    it("uses JSON and an info threshold in production", async () => {
        const info = vi.fn<Console["info"]>();
        await using handle = await makeDefaultLogConfigurationBuilder({
            production: true,
            console: { ...console, info },
        }).apply();
        getLogger("test").debug("hidden");
        getLogger("test").info("visible");
        await handle[Symbol.asyncDispose]();
        expect(info).toHaveBeenCalledOnce();
        expect(JSON.parse(String(info.mock.calls[0]?.[0]))).toMatchObject({ message: "visible" });
    });
});
