/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getConfig, type LogLevel, reset } from "@logtape/logtape";
import { makeDefaultLogConfigurationBuilder } from "../index.js";


beforeEach(() => {
    vi.stubEnv("NODE_ENV", undefined);
    vi.stubEnv("LOG_LEVEL", undefined);
});

afterEach(async () => {
    await reset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

it.each([
    [undefined, "console", "debug"],
    ["development", "console", "debug"],
    ["test", "console", "debug"],
    ["production", "json", "info"],
])("uses NODE_ENV=%s to choose output and fallback level", async (environment, sink, lowestLevel) => {
    vi.stubEnv("NODE_ENV", environment);
    await using handle = await makeDefaultLogConfigurationBuilder().apply();
    expect(handle).toBeDefined();
    expect(getConfig()?.loggers[0]).toMatchObject({ sinks: [sink], lowestLevel });
});

it.each<LogLevel>(["trace", "debug", "info", "warning", "error", "fatal"])(
    "uses LOG_LEVEL=%s for the root logger",
    async lowestLevel => {
        vi.stubEnv("LOG_LEVEL", lowestLevel);
        await using handle = await makeDefaultLogConfigurationBuilder().apply();
        expect(handle).toBeDefined();
        expect(getConfig()?.loggers[0]).toMatchObject({ lowestLevel });
        expect(getConfig()?.loggers[1]).toMatchObject({ lowestLevel: "warning" });
    },
);

it("allows explicit options to override the environment", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "invalid");
    await using handle = await makeDefaultLogConfigurationBuilder({ production: false, lowestLevel: "trace" }).apply();
    expect(handle).toBeDefined();
    expect(getConfig()?.loggers[0]).toMatchObject({ sinks: ["console"], lowestLevel: "trace" });
});

it("allows production output to be selected explicitly", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await using handle = await makeDefaultLogConfigurationBuilder({ production: true }).apply();
    expect(handle).toBeDefined();
    expect(getConfig()?.loggers[0]).toMatchObject({ sinks: ["json"], lowestLevel: "info" });
});

it("uses the production fallback for an empty LOG_LEVEL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "");
    await using handle = await makeDefaultLogConfigurationBuilder().apply();
    expect(handle).toBeDefined();
    expect(getConfig()?.loggers[0]).toMatchObject({ lowestLevel: "info" });
});

it.each(["invalid", "INFO", "warn", " info "])("rejects invalid LOG_LEVEL=%s before configuring logging", level => {
    vi.stubEnv("LOG_LEVEL", level);
    expect(() => makeDefaultLogConfigurationBuilder()).toThrow("Invalid LOG_LEVEL");
    expect(getConfig()).toBeNull();
});

it("reads the environment when building rather than applying", async () => {
    vi.stubEnv("LOG_LEVEL", "error");
    const builder = makeDefaultLogConfigurationBuilder();
    vi.stubEnv("LOG_LEVEL", "trace");
    await using handle = await builder.apply();
    expect(handle).toBeDefined();
    expect(getConfig()?.loggers[0]).toMatchObject({ lowestLevel: "error" });
});

it("uses development defaults when process is unavailable", async () => {
    vi.stubGlobal("process", undefined);
    await using handle = await makeDefaultLogConfigurationBuilder().apply();
    expect(handle).toBeDefined();
    expect(getConfig()?.loggers[0]).toMatchObject({ sinks: ["console"], lowestLevel: "debug" });
});
