/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { $ZodType, output } from "zod/v4/core";


/**
 * Serializes a JSON-compatible value into an application/json Blob.
 *
 * Serialization materializes the complete JSON representation before returning.
 *
 * @param value JSON-compatible value to serialize.
 * @returns A Blob containing UTF-8 JSON bytes.
 * @throws {unknown} If JSON serialization fails.
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
 * Parses a JSON Blob without loading Zod.
 *
 * @param blob Blob containing UTF-8 JSON bytes.
 * @returns The decoded JSON value.
 * @rejects For Blob read failures or malformed JSON.
 */
export function decodeJson(blob: Blob): Promise<unknown>;

/**
 * Parses a JSON Blob and validates it with an optional Zod peer dependency.
 *
 * The complete value is parsed before validation. Schema output is inferred,
 * including asynchronous refinements and transformations.
 *
 * @param blob Blob containing UTF-8 JSON bytes.
 * @param schema Zod 4 or Zod Mini schema used to validate the parsed JSON.
 * @returns The validated schema output.
 * @rejects For Blob read failures, malformed JSON, or schema validation failures.
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
