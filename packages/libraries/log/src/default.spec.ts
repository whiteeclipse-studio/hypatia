/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it, vi } from "vitest";
import { getConfig, reset } from "@logtape/logtape";


it("initializes logging once and exports a handle that disposes the configuration", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "error");
    expect(getConfig()).toBeNull();
    try {
        let logging: AsyncDisposable;
        {
            await using handle = (await import("@whiteeclipse/log/default")).default;
            logging = handle;
            const configured = getConfig();
            expect(configured).not.toBeNull();
            expect(configured?.loggers).toContainEqual({
                category: [],
                lowestLevel: "error",
                sinks: ["json"],
            });
            const imported = await import("@whiteeclipse/log/default");
            expect(imported.default).toBe(handle);
            expect(getConfig()).toBe(configured);
        }
        expect(getConfig()).toBeNull();
        await logging[Symbol.asyncDispose]();
        expect(getConfig()).toBeNull();
    } finally {
        await reset();
        vi.unstubAllEnvs();
    }
});
