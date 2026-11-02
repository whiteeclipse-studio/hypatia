/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { PrettyFormatterOptions } from "@logtape/pretty";


/** Name of the option mutator function. */
export type PrettyFormatterOptionMutatorName<K extends keyof PrettyFormatterOptions> = `with${Capitalize<K>}`;

/**
 * Converts a {@link PrettyFormatterOptions} key to the name of the option mutator function.
 *
 * @param key The {@link PrettyFormatterOptions} key.
 * @returns The name of the option mutator function.
 */
export function toPrettyFormatterOptionMutatorName<K extends keyof PrettyFormatterOptions>(
    key: K,
): PrettyFormatterOptionMutatorName<K> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return `with${key.slice(0, 1).toUpperCase()}${key.slice(1)}` as PrettyFormatterOptionMutatorName<K>;
}

/** Mapped type for an object that has {@link PrettyFormatterOptions} mutator functions. */
export type WithPrettyFormatterOptionMutators<Self> = {
    [K in PrettyFormatterKeys as PrettyFormatterOptionMutatorName<K>]: (value: PrettyFormatterOptions[K]) => Self;
};

/** List of all the {@link PrettyFormatterOptions} keys. */
export const PrettyFormatterKeys = [
    "timestamp",
    "timeZone",
    "level",
    "timestampColor",
    "timestampStyle",
    "levelColors",
    "levelStyle",
    "icons",
    "categorySeparator",
    "categoryColor",
    "categoryColorMap",
    "categoryStyle",
    "categoryWidth",
    "categoryTruncate",
    "messageColor",
    "messageStyle",
    "colors",
    "align",
    "inspectOptions",
    "properties",
    "wordWrap",
] as const satisfies readonly (keyof PrettyFormatterOptions)[];
export type PrettyFormatterKeys = (typeof PrettyFormatterKeys)[number];
