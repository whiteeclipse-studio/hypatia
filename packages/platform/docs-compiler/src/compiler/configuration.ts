/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompileConfiguration, CompilerConfiguration, WatchConfiguration } from "../types/index.js";


/**
 * Merges options and enables watching.
 *
 * @param base Initial configuration.
 * @param overrides Updates with watch enabled.
 * @returns A watch configuration.
 */
export function mergeCompilationConfiguration(
    base: CompilerConfiguration,
    overrides: Partial<CompilerConfiguration> & { readonly watch: true },
): WatchConfiguration;

/**
 * Merges options and disables watching.
 *
 * @param base Initial configuration.
 * @param overrides Updates with watch disabled.
 * @returns A one-shot configuration.
 */
export function mergeCompilationConfiguration(
    base: CompilerConfiguration,
    overrides: Partial<CompilerConfiguration> & { readonly watch: false },
): CompileConfiguration;

/**
 * Merges options for a one-shot compilation.
 *
 * @param base Initial configuration.
 * @param overrides Updates that preserve watch mode.
 * @returns A one-shot configuration.
 */
export function mergeCompilationConfiguration(
    base: CompileConfiguration,
    overrides: Partial<Omit<CompilerConfiguration, "watch">> & { readonly watch?: never },
): CompileConfiguration;

/**
 * Merges options for a watch session.
 *
 * @param base Initial configuration.
 * @param overrides Updates that preserve watch mode.
 * @returns A watch configuration.
 */
export function mergeCompilationConfiguration(
    base: WatchConfiguration,
    overrides: Partial<Omit<CompilerConfiguration, "watch">> & { readonly watch?: never },
): WatchConfiguration;

/**
 * Replaces repositories, appends plugins, and applies defined watch overrides.
 *
 * @param base Initial configuration.
 * @param overrides Option updates.
 * @returns A deeply frozen configuration. Shared nested values are also frozen.
 */
export function mergeCompilationConfiguration(
    base: CompilerConfiguration,
    overrides: Partial<CompilerConfiguration>,
): CompilerConfiguration;

/**
 * Applies defined updates and deeply freezes the merged configuration.
 *
 * @param base Initial configuration.
 * @param overrides Option updates.
 * @returns The merged configuration with frozen nested data.
 */
export function mergeCompilationConfiguration(
    base: CompilerConfiguration,
    overrides: Partial<CompilerConfiguration>,
): CompilerConfiguration {
    const merged = { ...base };
    if (overrides.repositories !== undefined) {
        merged.repositories = overrides.repositories;
    }
    if (overrides.plugins !== undefined) {
        merged.plugins = [...(base.plugins ?? []), ...overrides.plugins];
    }
    if (overrides.cache !== undefined) {
        merged.cache = {
            ...base.cache,
            ...(overrides.cache.memoryMaxBytes === undefined ? {} : { memoryMaxBytes: overrides.cache.memoryMaxBytes }),
            ...(overrides.cache.directory === undefined ? {} : { directory: overrides.cache.directory }),
            ...(overrides.cache.databaseName === undefined ? {} : { databaseName: overrides.cache.databaseName }),
        };
    }
    if (overrides.watch === undefined) {
        return freezeConfiguration(merged);
    }
    return freezeConfiguration(overrides.watch ? { ...merged, watch: true } : { ...merged, watch: false });
}

/**
 * Freezes the merged configuration graph, including shared arrays and plugins.
 *
 * @param configuration Merged options.
 * @returns The same configuration with recursively frozen data properties.
 */
function freezeConfiguration<Value>(configuration: Value): Value {
    const visited = new WeakSet<object>();

    /**
     * Freezes each nested object once, including cyclic data.
     *
     * @param value Configuration data to freeze.
     */
    function freeze(value: unknown): void {
        if (typeof value !== "object" || value === null || visited.has(value)) {
            return;
        }
        visited.add(value);
        for (const key of Reflect.ownKeys(value)) {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (descriptor !== undefined && "value" in descriptor) {
                freeze(descriptor.value);
            }
        }
        Object.freeze(value);
    }

    freeze(configuration);
    return configuration;
}
