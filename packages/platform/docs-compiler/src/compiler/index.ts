/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import "../polyfills.js";

import type {
    CompileConfiguration,
    CompilerConfiguration,
    ConfigHookContext,
    HookContext,
    Snapshot,
    WatchConfiguration,
    WatchResult,
} from "../types/index.js";
import { getLogger } from "@whiteeclipse/log";
import {
    createCloseBundleHookContext,
    createConfigHookContext,
    createConfigResolvedHookContext,
    executeCloseBundleHook,
    executeConfigHook,
    executeConfigResolvedHook,
} from "./hooks/index.js";
import { runCompilerPipeline } from "./pipeline/index.js";
import { createCompilerCache, DEFAULT_COMPILER_CACHE_CONFIGURATION } from "./cache/index.js";
import { createSnapshot } from "./snapshot/index.js";
import { createBuildScopes } from "./resources.js";
import { createWatchCache } from "./watch/cache.js";
import { createWatchCompiler } from "./watch/index.js";


export * from "./hooks/index.js";
export * from "./configuration.js";
export * from "./pipeline/index.js";
export { DEFAULT_COMPILER_CACHE_CONFIGURATION };

export type { WatchResult };

/**
 * Compiles inputs into a single owned snapshot.
 *
 * Calling compile() more than once in the same browser worker results in undefined
 * behaviour, including after failure or disposal. Use a new worker for each invocation.
 *
 * @param configuration Inputs with watching disabled or omitted.
 * @returns The completed snapshot.
 * @rejects If configuration, compilation, finalization, or snapshot assembly fails.
 */
export function compile(configuration: CompileConfiguration): Promise<Snapshot>;

/**
 * Starts a disposable stream of replacement snapshots.
 *
 * Calling compile() more than once in the same browser worker results in undefined
 * behaviour, including after failure or disposal. Use a new worker for each invocation.
 *
 * @param configuration Inputs with watching enabled.
 * @returns The watch session owning its snapshots.
 * @rejects If configuration, subscription setup, or the initial build fails.
 */
export function compile(configuration: WatchConfiguration): Promise<WatchResult>;

/**
 * Configures a compilation before selecting its mode.
 *
 * Calling compile() more than once in the same browser worker results in undefined
 * behaviour, including after failure or disposal. Use a new worker for each invocation.
 *
 * @param configuration Configuration for the requested compilation mode.
 * @returns The compilation result for the selected mode.
 * @rejects If configuration or initial compilation fails.
 */
export async function compile(configuration: CompilerConfiguration): Promise<Snapshot | WatchResult> {
    const shutdown = new AbortController();
    await using resources = new AsyncDisposableStack();
    const cacheResources = resources.use(new AsyncDisposableStack());
    const serviceResources = resources.use(new AsyncDisposableStack());
    const context: ConfigHookContext = {
        logger: getLogger(["whiteeclipse", "docs-compiler"]),
        signal: shutdown.signal,
        onDispose(cleanup) {
            resources.defer(cleanup);
        },
    };

    let handedOff = false;
    try {
        const configured = await executeConfigHook(configuration, createConfigHookContext(context));
        const cache = cacheResources.use(await createCompilerCache(configured.cache));
        const buildContext: HookContext = {
            ...context,
            cache,
            async watch() {
                await Promise.resolve();
            },
        };
        if (configured.watch === true) {
            const watchCache = serviceResources.use(createWatchCache(cache));
            const scopes = serviceResources.use(createBuildScopes(shutdown.signal));
            const watchers = serviceResources.use(new AsyncDisposableStack());
            const watch = createWatchCompiler(configured, buildContext, {
                cache: watchCache,
                scopes,
                watchers,
                abort() {
                    shutdown.abort();
                },
                async [Symbol.asyncDispose]() {
                    await ownedResources.disposeAsync();
                },
            });
            await executeConfigResolvedHook(configured, createConfigResolvedHookContext(watch.context));
            await watch.initialize();
            const ownedResources = resources.move();
            handedOff = true;
            return watch.result;
        }
        await executeConfigResolvedHook(configured, createConfigResolvedHookContext(buildContext));
        const repositories = await runCompilerPipeline(configured, buildContext);

        await executeCloseBundleHook(repositories, configured, createCloseBundleHookContext(buildContext));
        const snapshot = createSnapshot(repositories, async () => {
            shutdown.abort();
            await ownedResources.disposeAsync();
        });
        const ownedResources = resources.move();
        handedOff = true;
        return snapshot;
    } finally {
        if (!handedOff) {
            shutdown.abort();
        }
    }
}
