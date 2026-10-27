/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { requireCondition } from "../errors.ts";

/**
 * Requires a plain JSON object.
 *
 * @param value - Untrusted parsed JSON.
 * @returns An object with unknown field values.
 * @throws {DocumentationError} When the input is not an object.
 */
export function objectValue(value: unknown): Record<string, unknown> {
    requireCondition(typeof value === "object" && value !== null && !Array.isArray(value), "Expected a JSON object");
    const fields: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(value)) {
        Object.defineProperty(fields, key, { value: field, enumerable: true });
    }
    return fields;
}

/**
 * Requires a nonempty string.
 *
 * @param value - Untrusted field.
 * @returns The validated string.
 * @throws {DocumentationError} When the field is not a nonempty string.
 */
export function stringValue(value: unknown): string {
    requireCondition(typeof value === "string" && value.trim().length > 0, "Expected a nonempty string");
    return value;
}

/**
 * Requires an array without narrowing its elements unsafely.
 *
 * @param value - Untrusted field.
 * @returns Unknown-valued array.
 * @throws {DocumentationError} When the field is not an array.
 */
export function arrayValue(value: unknown): unknown[] {
    requireCondition(Array.isArray(value), "Expected an array");
    return Array.from<unknown>(value);
}

/**
 * Requires a boolean field.
 *
 * @param value - Untrusted field.
 * @returns The validated boolean.
 * @throws {DocumentationError} When the field is not boolean.
 */
export function booleanValue(value: unknown): boolean {
    requireCondition(typeof value === "boolean", "Expected a boolean");
    return value;
}

/**
 * Requires a positive integer.
 *
 * @param value - Untrusted field.
 * @returns The validated number.
 * @throws {DocumentationError} When the field is not a positive safe integer.
 */
export function positiveInteger(value: unknown): number {
    requireCondition(
        typeof value === "number" && Number.isSafeInteger(value) && value > 0,
        "Expected a positive integer",
    );
    return value;
}
