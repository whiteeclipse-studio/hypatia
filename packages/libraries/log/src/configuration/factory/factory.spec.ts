/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { reset } from "@logtape/logtape";
import { buildFactoryMap } from "./index";


afterEach(async () => {
    await reset();
});

describe("factory cleanup", () => {
    it("prefers async disposal and continues after synchronous cleanup failures", async () => {
        const order: string[] = [];
        const sync = vi.fn<() => void>();
        const map = await buildFactoryMap<string, object>([
            {
                name: "first",
                build() {
                    return {
                        async [Symbol.asyncDispose]() {
                            await Promise.resolve();
                            order.push("first");
                        },
                        [Symbol.dispose]: sync,
                    };
                },
            },
            {
                name: "last",
                build() {
                    return {
                        [Symbol.dispose]() {
                            order.push("last");
                            throw new Error("cleanup");
                        },
                    };
                },
            },
        ]);
        await expect(map[Symbol.asyncDispose]()).rejects.toThrow(AggregateError);
        expect(order).toEqual(["last", "first"]);
        expect(sync).not.toHaveBeenCalled();
        await map[Symbol.asyncDispose]();
        expect(order).toEqual(["last", "first"]);
    });

    it("preserves both construction and cleanup failures", async () => {
        const construction = new Error("construction");
        const cleanup = new Error("cleanup");
        const promise = buildFactoryMap<string, object>([
            {
                name: "first",
                build() {
                    return {
                        [Symbol.dispose]() {
                            throw cleanup;
                        },
                    };
                },
            },
            {
                name: "broken",
                build() {
                    throw construction;
                },
            },
        ]);
        await expect(promise).rejects.toMatchObject({
            errors: [construction, expect.objectContaining({ errors: [cleanup] })],
        });
    });
});
