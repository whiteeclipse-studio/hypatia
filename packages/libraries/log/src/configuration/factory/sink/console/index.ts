/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter, type PrettyFormatterOptions } from "@logtape/pretty";

import type { LogConsoleSinkFactory } from "./types";
import { PrettyFormatterKeys, toPrettyFormatterOptionMutatorName } from "./options.js";
import { DEFAULT_PRETTY_FORMATTER_OPTIONS } from "./default";


export type * from "./types";

/**
 * Builds a {@link LogConsoleSinkFactory}.
 *
 * @param console An override for the global console object.
 * @param options The options to configure the pretty formatter.
 * @returns The generated {@link LogConsoleSinkFactory} object.
 */
export function makeLogConsoleSinkFactory(
    console: Console = globalThis.console,
    options: PrettyFormatterOptions = structuredClone(DEFAULT_PRETTY_FORMATTER_OPTIONS),
): LogConsoleSinkFactory {
    // Prepare the factory object.
    const factory: Pick<LogConsoleSinkFactory, "name" | "build"> = {
        name: "console",
        build() {
            return getConsoleSink({
                console,
                nonBlocking: true,
                formatter: getPrettyFormatter(options),
            });
        },
    };

    // Inject the option methods.
    injectOptionMethods(factory);

    return factory;

    /**
     * Adds immutable formatter option setters to a sink factory.
     *
     * @param object The factory receiving setters.
     */
    function injectOptionMethods(
        object: Pick<LogConsoleSinkFactory, "name" | "build">,
    ): asserts object is LogConsoleSinkFactory {
        for (const key of PrettyFormatterKeys) {
            Object.defineProperty(object, toPrettyFormatterOptionMutatorName(key), {
                value(value: PrettyFormatterOptions[PrettyFormatterKeys]) {
                    return makeLogConsoleSinkFactory(console, { ...options, [key]: value });
                },
            });
        }
    }
}
