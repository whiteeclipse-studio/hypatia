/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { LoggerConfig } from "@logtape/logtape";
import type { LogConfigurationFactoriesNames, LogFilterFactory, LogSinkFactory } from "./factory/index.js";

// Helper used to extract the names of the factories in a tuple.
type TypedLoggerConfig<
    Sinks extends readonly LogSinkFactory[],
    Filters extends readonly LogFilterFactory[],
> = LoggerConfig<LogConfigurationFactoriesNames<Sinks>, LogConfigurationFactoriesNames<Filters>>;

/**
 * Builder object used to configure LogTape.
 *
 * Provides a builder pattern to simplify complex logging configuration.
 */
export interface LogConfigurationBuilder<
    Sinks extends readonly LogSinkFactory[] = [],
    Filters extends readonly LogFilterFactory[] = [],
> {
    /**
     * Adds a new sink to the configuration.
     *
     * @param sink The sink to add.
     * @returns A new builder object, with the sink added.
     */
    withSink<const T extends LogSinkFactory>(sink: T): LogConfigurationBuilder<readonly [...Sinks, T], Filters>;

    /**
     * Adds a new filter to the configuration.
     *
     * @param filter The filter to add.
     * @returns A new builder object, with the filter added.
     */
    withFilter<const T extends LogFilterFactory>(filter: T): LogConfigurationBuilder<Sinks, readonly [...Filters, T]>;

    /**
     * Adds a new logger to the configuration.
     *
     * @param logger The logger to add.
     * @returns A new builder object, with the logger added.
     */
    withLogger(logger: TypedLoggerConfig<Sinks, Filters>): LogConfigurationBuilder<Sinks, Filters>;

    /**
     * Applies the build configuration to LogTape.
     *
     * @returns A promise that resolves with a disposable object to clean up any resources allocated by the sinks.
     */
    apply(): Promise<AsyncDisposable>;
}
