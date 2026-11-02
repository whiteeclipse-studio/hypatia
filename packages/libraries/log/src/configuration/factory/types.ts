/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Filter, Sink } from "@logtape/logtape";


/** Base type for either {@link LogSinkFactory} or {@link LogFilterFactory}. */
export interface LogConfigurationFactory<Name extends string, Output extends object> {
    /** The name of the factory. */
    readonly name: Name;

    /**
     * Builds the underlying object.
     *
     * @returns The underlying object.
     */
    build(): MaybePromise<MaybeDisposable<Output>>;
}

// Allows Disposable as a marker on the type.
type MaybeDisposable<T> = T | (T & Disposable) | (T & AsyncDisposable);
// Allows Promise as a marker on the type.
type MaybePromise<T> = T | PromiseLike<T>;

/** Extracts the name from a {@link LogConfigurationFactory}. */
export type LogConfigurationFactoryName<T extends LogConfigurationFactory<string, object>> = T["name"];

/** Extracts the name from a {@link LogConfigurationFactory} list. */
export type LogConfigurationFactoriesNames<T extends readonly LogConfigurationFactory<string, object>[]> =
    LogConfigurationFactoryName<T[number]>;

/**
 * Factory used to create a LogTape {@link Sink}.
 *
 * The factory can be attached to a {@link LogConfigurationBuilder} object, and be used to create a {@link Sink}.
 */
export type LogSinkFactory<Name extends string = string, Output extends Sink = Sink> = LogConfigurationFactory<
    Name,
    Output
>;

/**
 * Factory used to create a LogTape {@link Filter}.
 *
 * The factory can be attached to a {@link LogConfigurationBuilder} object, and be used to create a {@link Filter}.
 */
export type LogFilterFactory<Name extends string = string, Output extends Filter = Filter> = LogConfigurationFactory<
    Name,
    Output
>;
