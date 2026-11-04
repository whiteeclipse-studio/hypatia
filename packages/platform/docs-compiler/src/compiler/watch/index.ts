/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, ResolvedCompilerConfiguration, WatchResult } from "../../types/index.js";
import type { BuildScopes } from "../resources.js";
import type { WatchCache } from "./cache.js";
import { buildWatchGeneration, type WatchBuildState } from "./build.js";
import { createWatchScheduler } from "./scheduler/index.js";
import { createWatchSubscriptions } from "./subscriptions.js";
import { getReferenceKey } from "../pipeline/reference.js";


/** Resource owners created and retained by compile. */
export interface WatchOwners extends AsyncDisposable {
    /** Compiler-owned bookkeeping around the shared backing cache. */
    readonly cache: WatchCache;
    /** Compiler-owned resource lifetimes for build attempts and snapshots. */
    readonly scopes: BuildScopes;
    /** Compiler-owned stack responsible for subscription cleanup. */
    readonly watchers: AsyncDisposableStack;

    /** Signals session cancellation, including cancellation of active build scopes. */
    abort(this: void): void;

    /**
     * Releases the compiler's remaining session resources after watch work drains.
     *
     * @returns Completion of compiler-owned cleanup.
     * @rejects If resource cleanup fails.
     */
    [Symbol.asyncDispose](this: void): Promise<void>;
}

/** Watch orchestration borrowing all resource owners from compile. */
export interface WatchCompiler {
    /** Context for session hooks; subscriptions registered here survive individual builds. */
    readonly context: HookContext;
    /** Snapshot and error streams, with disposal controlling session shutdown. */
    readonly result: WatchResult;

    /**
     * Builds and publishes the initial snapshot, then enables scheduled rebuilds.
     * Called once, after configResolved hooks finish registering subscriptions.
     *
     * @returns Completion of the initial build and publication.
     * @rejects If the initial build fails.
     */
    initialize(this: void): Promise<void>;
}

/**
 * Connects subscriptions, incremental builds, and publication without owning resources.
 *
 * @param configuration Final session configuration.
 * @param base Session services owned by compile.
 * @param owners Compiler-owned resource managers and shutdown callbacks.
 * @returns Watch orchestration initialized after configResolved hooks register subscriptions.
 */
export function createWatchCompiler(
    configuration: ResolvedCompilerConfiguration,
    base: HookContext,
    owners: WatchOwners,
): WatchCompiler {
    const state: WatchBuildState = { records: new Map() };
    const subscriptions = createWatchSubscriptions(owners.watchers, {
        signal: base.signal,
        invalidate(references) {
            scheduler.invalidate(references);
        },
        reportError(error) {
            scheduler.reportError(error);
        },
    });

    const context: HookContext = {
        ...base,
        cache: owners.cache.cache,
        async watch(reference, subscribe) {
            subscriptions.global.add(getReferenceKey(reference));
            await subscriptions.watch(reference, subscribe);
        },
    };

    const scheduler = createWatchScheduler({
        signal: base.signal,
        logger: base.logger,
        async build(changes) {
            return buildWatchGeneration(
                configuration,
                state,
                { context, cache: owners.cache, scopes: owners.scopes, subscriptions },
                changes,
            );
        },
        async stop() {
            owners.abort();

            await using cleanup = new AsyncDisposableStack();
            cleanup.use(owners.watchers);
            cleanup.use(state.current);
        },
        [Symbol.asyncDispose]: owners[Symbol.asyncDispose],
    });
    return { context, result: scheduler.result, initialize: scheduler.initialize };
}
