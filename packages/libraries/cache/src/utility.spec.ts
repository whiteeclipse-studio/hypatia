/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, expectTypeOf, it, vi } from "vitest";
import * as z from "zod";
import * as mini from "zod/mini";
import { decodeJson, encodeJson } from "./utility.ts";


/**
 * Creates a text fixture.
 *
 * @param text Fixture content.
 * @returns A UTF-8 Blob.
 */
function textBlob(text: string): Blob {
    return new Blob([text]);
}

it("round-trips structured JSON and Unicode through Blobs", async () => {
    const value = { title: "資料 — Français", count: 2, tags: ["日本語"], note: null };
    const schema = z.object({
        title: z.string(),
        count: z.number(),
        tags: z.array(z.string()),
        note: z.null(),
    });

    const result = await decodeJson(encodeJson(value), schema);

    expect(result).toEqual(value);
    expectTypeOf(result).toEqualTypeOf<z.output<typeof schema>>();
});

it("decodes JSON null", async () => {
    await expect(decodeJson(textBlob("null"), z.null())).resolves.toBeNull();
});

it("decodes JSON without a schema as unknown", async () => {
    const result = await decodeJson(encodeJson({ title: "Getting started" }));

    expectTypeOf(result).toEqualTypeOf<unknown>();
    expect(result).toEqual({ title: "Getting started" });
});

it.each(["{", ""])("rejects malformed or empty JSON: %j", async text => {
    await expect(decodeJson(textBlob(text), z.unknown())).rejects.toBeInstanceOf(SyntaxError);
});

it("rejects JSON that does not satisfy the schema", async () => {
    await expect(decodeJson(textBlob('{"count":"two"}'), z.object({ count: z.number() }))).rejects.toMatchObject({
        issues: [expect.objectContaining({ code: "invalid_type", path: ["count"] })],
    });
});

it("returns inferred asynchronous schema transformations", async () => {
    const schema = z.string().transform(async value => Promise.resolve(value.length));
    const result = await decodeJson(textBlob('"hello"'), schema);

    expectTypeOf(result).toEqualTypeOf<number>();
    expect(result).toBe(5);
});

it("supports asynchronous schema refinements", async () => {
    const schema = z.string().refine(async value => Promise.resolve(value === "allowed"));

    await expect(decodeJson(textBlob('"denied"'), schema)).rejects.toMatchObject({
        issues: [expect.objectContaining({ code: "custom" })],
    });
});

it("accepts Zod Mini schemas through the shared core API", async () => {
    const result = await decodeJson(textBlob('{"count":3}'), mini.object({ count: mini.number() }));

    expectTypeOf(result).toEqualTypeOf<{ count: number }>();
    expect(result).toEqual({ count: 3 });
});

it.each([undefined, 1n])("rejects unserializable top-level values: %s", value => {
    expect(() => encodeJson(value)).toThrow(TypeError);
});

it("rejects cyclic data", () => {
    const value: { self?: unknown } = {};
    value.self = value;

    expect(() => encodeJson(value)).toThrow(TypeError);
});

it("propagates Blob read failures", async () => {
    const error = new Error("Read interrupted.");
    const blob = new Blob();
    vi.spyOn(blob, "text").mockRejectedValue(error);
    await expect(decodeJson(blob, z.unknown())).rejects.toBe(error);
});

it("produces an application/json Blob", async () => {
    const blob = encodeJson({ count: 3 });
    expect(blob.type).toMatch(/^application\/json(?:;|$)/);
    expect(await blob.text()).toBe('{"count":3}');
});
