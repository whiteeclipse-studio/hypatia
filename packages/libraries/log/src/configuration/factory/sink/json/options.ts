/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { JsonLinesFormatterOptions } from "@logtape/logtape";


/** Name of the option mutator function. */
export type JsonLinesFormatterOptionMutatorName<K extends keyof JsonLinesFormatterOptions> = `with${Capitalize<K>}`;

/**
 * Converts a {@link JsonLinesFormatterOptions} key to the name of the option mutator function.
 *
 * @param key The {@link JsonLinesFormatterOptions} key.
 * @returns The name of the option mutator function.
 */
export function toJsonLinesFormatterOptionMutatorName<K extends keyof JsonLinesFormatterOptions>(
    key: K,
): JsonLinesFormatterOptionMutatorName<K> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return `with${key.slice(0, 1).toUpperCase()}${key.slice(1)}` as JsonLinesFormatterOptionMutatorName<K>;
}

/** Mapped type for an object that has {@link JsonLinesFormatterOptions} mutator functions. */
export type WithJsonLinesFormatterOptionMutators<Self> = {
    [K in JSONFormatterKeys as JsonLinesFormatterOptionMutatorName<K>]: (value: JsonLinesFormatterOptions[K]) => Self;
};

/** List of all the {@link JsonLinesFormatterOptions} keys. */
export const JSONFormatterKeys = [
    "message",
    "lineEnding",
    "categorySeparator",
    "properties",
] as const satisfies readonly (keyof JsonLinesFormatterOptions)[];
export type JSONFormatterKeys = (typeof JSONFormatterKeys)[number];
