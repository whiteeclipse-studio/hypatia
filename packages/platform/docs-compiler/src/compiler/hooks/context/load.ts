/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, LoadHookContext } from "../../../types";


/**
 * Creates the context for load hooks.
 *
 * @param context Shared compilation services.
 * @param dependencies Child loading, resolution, and queued inclusion services.
 * @returns A frozen context with a load child logger.
 */
export function createLoadHookContext(
    context: HookContext,
    dependencies: Pick<LoadHookContext, "load" | "resolve" | "include">,
): LoadHookContext {
    return Object.freeze({
        logger: context.logger.getChild("load"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
        load: dependencies.load,
        resolve: dependencies.resolve,
        include: dependencies.include,
    });
}
