/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, Reference, ResolvedCompilerConfiguration, Snapshot } from "../../types";
import type { BuildScopes } from "../resources";
import { runCompilerPipeline } from "../pipeline";
import { createIncrementalBuild, type SourceRecord } from "../pipeline/incremental";
import { getReferenceKey } from "../pipeline/reference";
import { createSnapshot } from "../snapshot";
import type { WatchCache } from "./cache";
import type { WatchPublication } from "./scheduler";
import type { WatchSubscriptions } from "./subscriptions";


/** Last published state, replaced only after successful snapshot preparation. */
export interface WatchBuildState {
    /** Captured source results from the last successful build, indexed by source identity. */
    records: ReadonlyMap<string, SourceRecord>;
    /** Latest prepared snapshot; absent until the first successful build. */
    current?: Snapshot;
}

/** Borrowed services whose owners all remain in compile. */
export interface WatchBuildServices {
    /** Session hook services used as the base for the build-specific context. */
    readonly context: HookContext;
    /** Compiler-owned manager creating a separate resource lifetime for each attempt. */
    readonly scopes: BuildScopes;
    /** Shared payload storage and bookkeeping for active builds and retained records. */
    readonly cache: WatchCache;
    /** Session subscriptions reused across builds and pruned after replacement. */
    readonly subscriptions: WatchSubscriptions;
}

/**
 * Prepares one incremental replacement using compiler-owned resource scopes.
 *
 * @param configuration Final session configuration.
 * @param state Last published records and snapshot.
 * @param services Borrowed cache, subscriptions, and build resource owner.
 * @param changes Coalesced source invalidations.
 * @returns A prepared snapshot and retirement operation for publication.
 * @rejects If processing fails; the previous published state remains active.
 */
export async function buildWatchGeneration(
    configuration: ResolvedCompilerConfiguration,
    state: WatchBuildState,
    services: WatchBuildServices,
    changes: readonly Reference[],
): Promise<WatchPublication> {
    const scope = services.scopes.create();
    const frame = services.cache.frame();
    scope.onDispose(frame.release);
    const watches = new Set(services.subscriptions.global);
    const context: HookContext = {
        ...services.context,
        signal: scope.signal,
        cache: frame.cache,
        onDispose: scope.onDispose,
        async watch(reference, subscribe) {
            watches.add(getReferenceKey(reference));
            await services.subscriptions.watch(reference, subscribe);
        },
    };
    const build = createIncrementalBuild(state.records, changes, services.cache.readPayload);
    try {
        const repositories = await runCompilerPipeline(configuration, context, build);
        context.signal.throwIfAborted();
        const snapshot = createSnapshot(repositories, async () => {
            await scope[Symbol.asyncDispose]();
        });
        const previous = state.current;
        services.cache.retain(build.records);
        state.records = build.records;
        state.current = snapshot;
        for (const record of build.records.values()) {
            for (const key of record.watches) {
                watches.add(key);
            }
        }
        return {
            snapshot,
            async retire() {
                try {
                    await previous?.[Symbol.asyncDispose]();
                } finally {
                    await services.subscriptions.prune(watches);
                }
            },
        };
    } catch (error) {
        try {
            await scope[Symbol.asyncDispose]();
        } catch (cleanupError) {
            throw new SuppressedError(cleanupError, error, "Build processing and cleanup failed.");
        }
        throw error;
    }
}
