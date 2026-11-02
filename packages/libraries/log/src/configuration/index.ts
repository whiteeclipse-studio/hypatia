/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import {
    configure,
    type Filter,
    getConfig,
    isLogLevel,
    type LoggerConfig,
    type LogLevel,
    reset,
    type Sink,
} from "@logtape/logtape";

import type { LogConfigurationBuilder } from "./types";
import {
    buildFactoryMap,
    type LogConsoleSinkFactory,
    type LogFilterFactory,
    type LogSinkFactory,
    makeLogConsoleSinkFactory,
    makeLogJSONSinkFactory,
} from "./factory";


export type { LogConfigurationBuilder, LogConsoleSinkFactory, LogFilterFactory, LogSinkFactory };
export { makeLogConsoleSinkFactory, makeLogJSONSinkFactory };

/**
 * Creates a new configuration builder object.
 *
 * The builder pattern allows for easy configuration of the logging system.
 * To use the default configuration, see {@link makeDefaultLogConfigurationBuilder}.
 *
 * @returns A new configuration builder object.
 */
export function makeLogConfigurationBuilder(): LogConfigurationBuilder {
    return deriveLogConfigurationBuilder([] as const, [] as const, []);
}

/** Options for the default application logging configuration. */
export interface DefaultLogConfigurationOptions {
    /** Override NODE_ENV-based selection of JSON output and the info-level fallback. */
    production?: boolean;
    /** Override LOG_LEVEL and the production-dependent fallback threshold. */
    lowestLevel?: LogLevel;
    /** Console receiving formatted records; defaults to the global console. */
    console?: Console;
}

/**
 * Builds a default root logger using explicit options, environment variables, then fallbacks.
 *
 * @param options Explicit application defaults.
 * @returns A builder with a console or JSON sink and a root logger.
 * @throws {TypeError} If LOG_LEVEL is non-empty and invalid without an explicit level override.
 */
export function makeDefaultLogConfigurationBuilder(
    options: DefaultLogConfigurationOptions = {},
): LogConfigurationBuilder<readonly [LogSinkFactory<"console" | "json">]> {
    const production = options.production ?? false;
    let sink: LogSinkFactory<"console" | "json"> = makeLogConsoleSinkFactory(options.console);
    if (production) {
        sink = makeLogJSONSinkFactory(options.console);
    }
    const lowestLevel = resolveDefaultLogLevel(production, options.lowestLevel);

    return makeLogConfigurationBuilder()
        .withSink(sink)
        .withLogger({
            category: [],
            lowestLevel,
            sinks: [sink.name],
        })
        .withLogger({
            category: ["logtape", "meta"],
            lowestLevel: "warning",
            sinks: [sink.name],
            parentSinks: "override",
        });
}

/**
 * Resolves a validated level or the production-dependent fallback.
 *
 * @param production Whether production defaults apply.
 * @param level The explicit or environment-provided level.
 * @returns The root logger threshold.
 * @throws {TypeError} If a non-empty level is invalid.
 */
function resolveDefaultLogLevel(production: boolean, level: string | undefined): LogLevel {
    if (level !== undefined && level !== "") {
        if (!isLogLevel(level)) {
            throw new TypeError(`Invalid LOG_LEVEL '${level}'. Expected trace, debug, info, warning, error, or fatal.`);
        }
        return level;
    }
    if (production) {
        return "info";
    }
    return "debug";
}

/**
 * Derives an immutable configuration builder.
 *
 * @param sinkFactories Registered sink factories.
 * @param filterFactories Registered filter factories.
 * @param loggers Registered logger configuration.
 * @returns The derived builder.
 */
function deriveLogConfigurationBuilder<
    Sinks extends readonly LogSinkFactory[],
    Filters extends readonly LogFilterFactory[],
>(
    sinkFactories: Sinks,
    filterFactories: Filters,
    loggers: LoggerConfig<string, string>[],
): LogConfigurationBuilder<Sinks, Filters> {
    return {
        withSink(sink) {
            // Check if the sink exists.
            if (sinkFactories.some(existing => existing.name === sink.name)) {
                throw new TypeError(`Sink with name '${sink.name}' already exists.`);
            }

            return deriveLogConfigurationBuilder([...sinkFactories, sink], filterFactories, loggers);
        },
        withFilter(filter) {
            // Check if the filter exists.
            if (filterFactories.some(existing => existing.name === filter.name)) {
                throw new TypeError(`Filter with name '${filter.name}' already exists.`);
            }

            return deriveLogConfigurationBuilder(sinkFactories, [...filterFactories, filter], loggers);
        },
        withLogger(logger) {
            return deriveLogConfigurationBuilder(sinkFactories, filterFactories, [...loggers, logger]);
        },
        async apply() {
            let sinks: (Record<string, Sink> & AsyncDisposable) | undefined;
            let filters: (Record<string, Filter> & AsyncDisposable) | undefined;
            try {
                sinks = await buildFactoryMap(sinkFactories);
                filters = await buildFactoryMap(filterFactories);

                await configure({ sinks, filters, loggers });
                const installed = getConfig();
                let disposed = false;
                return {
                    async [Symbol.asyncDispose]() {
                        if (!disposed && getConfig() === installed) {
                            disposed = true;
                            await reset();
                        }
                    },
                };
            } catch (exception) {
                try {
                    await dispose();
                } catch (cleanupError) {
                    throw new AggregateError([exception, cleanupError], "Logging configuration and cleanup failed.", {
                        cause: cleanupError,
                    });
                }
                throw exception;
            }

            /**
             * Cleans up both factory maps after a failed application.
             *
             * @returns Completion of both cleanup attempts.
             * @rejects If either factory map fails to dispose.
             */
            async function dispose() {
                const results = await Promise.allSettled([
                    filters?.[Symbol.asyncDispose](),
                    sinks?.[Symbol.asyncDispose](),
                ]);
                const errors: unknown[] = [];
                for (const result of results) {
                    if (result.status === "rejected") {
                        errors.push(result.reason);
                    }
                }
                if (errors.length > 0) {
                    throw new AggregateError(errors, "Logging factory cleanup failed.");
                }
            }
        },
    };
}
