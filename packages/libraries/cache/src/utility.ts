/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { $ZodType, output } from "zod/v4/core";


/**
 * Serializes a value to JSON in memory.
 *
 * @param value JSON-compatible value.
 * @returns An application/json Blob.
 * @throws {unknown} If the value cannot be serialized.
 */
export function encodeJson(value: unknown): Blob {
    // Unsupported root values can produce undefined despite the library typing.
    const json: unknown = JSON.stringify(value);
    if (typeof json !== "string") {
        throw new TypeError("The value has no JSON representation.");
    }
    return new Blob([json], { type: "application/json" });
}

/**
 * Parses JSON without loading Zod.
 *
 * @param blob JSON to parse.
 * @returns The parsed value.
 * @rejects If reading or parsing fails.
 */
export function decodeJson(blob: Blob): Promise<unknown>;

/**
 * Parses JSON and validates it asynchronously with Zod.
 *
 * @param blob JSON to parse.
 * @param schema Zod 4 or Zod Mini schema; requires the optional Zod peer.
 * @returns The schema output, including transformations.
 * @rejects If reading, parsing, or validation fails.
 */
export function decodeJson<Schema extends $ZodType>(blob: Blob, schema: Schema): Promise<output<Schema>>;

export async function decodeJson(blob: Blob, schema?: $ZodType): Promise<unknown> {
    const value: unknown = JSON.parse(await blob.text());
    if (schema === undefined) {
        return value;
    }
    const { parseAsync } = await import("zod/v4/core");
    return parseAsync(schema, value);
}
