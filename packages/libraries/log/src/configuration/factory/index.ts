/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { manageDisposable } from "./disposal.js";

import type { LogConfigurationFactory } from "./types.js";


export * from "./sink/index.js";
export type * from "./types.js";

/**
 * Builds a map of log configuration factories.
 *
 * Invokes the "build" method on all the factories, and re-composes a map from the results.
 * Stores all disposables for later disposal.
 *
 * @param factories The factories to build.
 * @returns The map of factories.
 * @rejects If a factory throws an exception.
 */
export async function buildFactoryMap<Names extends string, Outputs extends object>(
    factories: readonly LogConfigurationFactory<Names, Outputs>[],
): Promise<Record<Names, Awaited<Outputs>> & AsyncDisposable> {
    // Store all the disposing methods.
    const disposeMethods = new Set<VoidFunction | (() => Promise<void>)>();

    try {
        // Invoke all the factory builders.
        const entries: [Names, Awaited<Outputs>][] = [];
        for (const factory of factories) {
            const result = manageDisposable(await factory.build());
            if (Symbol.asyncDispose in result) {
                disposeMethods.add(result[Symbol.asyncDispose].bind(result));
            } else if (Symbol.dispose in result) {
                disposeMethods.add(result[Symbol.dispose].bind(result));
            }
            entries.push([factory.name, result]);
        }

        // Build the object.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const object = Object.fromEntries(entries) as Record<Names, Awaited<Outputs>>;
        return Object.assign(object, { [Symbol.asyncDispose]: disposeAll });
    } catch (error) {
        try {
            await disposeAll();
        } catch (cleanupError) {
            throw new AggregateError([error, cleanupError], "Logging factory construction and cleanup failed.", {
                cause: cleanupError,
            });
        }
        throw error;
    }

    /**
     * Disposes acquired entries once, in reverse order, collecting failures.
     *
     * @returns Completion of all cleanup attempts.
     * @rejects If any acquired resource fails to dispose.
     */
    async function disposeAll(): Promise<void> {
        const methods = [...disposeMethods].reverse();
        disposeMethods.clear();
        const errors: unknown[] = [];
        for (const method of methods) {
            try {
                await method();
            } catch (error) {
                errors.push(error);
            }
        }
        if (errors.length > 0) {
            throw new AggregateError(errors, "Logging factory cleanup failed.");
        }
    }
}
