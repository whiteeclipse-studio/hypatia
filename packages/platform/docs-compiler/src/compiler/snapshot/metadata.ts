/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Freezes a copied data graph, tolerating cycles.
 *
 * @param value Copied metadata or a nested value.
 * @param visited Objects already visited in this data graph.
 */
function freeze(value: unknown, visited: WeakSet<object>): void {
    if (typeof value !== "object" || value === null || visited.has(value)) {
        return;
    }
    visited.add(value);
    for (const child of Object.values(value)) {
        freeze(child, visited);
    }
    Object.freeze(value);
}

/**
 * Copies metadata and freezes its nested data without changing plugin-owned values.
 *
 * @param metadata Plugin metadata.
 * @returns An independent frozen copy.
 */
export function copyMetadata<Value>(metadata: Value): Value {
    const copy = structuredClone(metadata);
    freeze(copy, new WeakSet());
    return copy;
}
