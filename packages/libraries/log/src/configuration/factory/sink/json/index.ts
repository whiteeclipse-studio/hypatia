/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { getConsoleSink, getJsonLinesFormatter, type JsonLinesFormatterOptions } from "@logtape/logtape";

import type { LogJSONSinkFactory } from "./types.js";
import { DEFAULT_JSON_FORMATTER_OPTIONS } from "./default.js";
import { JSONFormatterKeys, toJsonLinesFormatterOptionMutatorName } from "./options.js";


export type * from "./types.js";

/**
 * Builds a {@link LogJSONSinkFactory}.
 *
 * @param console An override for the global console object.
 * @param options The options to configure the pretty formatter.
 * @returns The generated {@link LogJSONSinkFactory} object.
 */
export function makeLogJSONSinkFactory(
    console: Console = globalThis.console,
    options: JsonLinesFormatterOptions = structuredClone(DEFAULT_JSON_FORMATTER_OPTIONS),
): LogJSONSinkFactory {
    // Prepare the factory object.
    const factory: Pick<LogJSONSinkFactory, "name" | "build"> = {
        name: "json",
        build() {
            return getConsoleSink({
                console,
                nonBlocking: true,
                formatter: getJsonLinesFormatter(options),
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
        object: Pick<LogJSONSinkFactory, "name" | "build">,
    ): asserts object is LogJSONSinkFactory {
        for (const key of JSONFormatterKeys) {
            Object.defineProperty(object, toJsonLinesFormatterOptionMutatorName(key), {
                value(value: JsonLinesFormatterOptions[JSONFormatterKeys]) {
                    return makeLogJSONSinkFactory(console, { ...options, [key]: value });
                },
            });
        }
    }
}
