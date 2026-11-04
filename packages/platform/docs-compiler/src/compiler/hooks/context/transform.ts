/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, TransformHookContext } from "../../../types";


/**
 * Creates the context for transform hooks.
 *
 * @param context Shared compilation services.
 * @param dependencies Child loading, resolution, and queued inclusion services.
 * @returns A frozen context with a transform child logger.
 */
export function createTransformHookContext(
    context: HookContext,
    dependencies: Pick<TransformHookContext, "load" | "resolve" | "include">,
): TransformHookContext {
    return Object.freeze({
        logger: context.logger.getChild("transform"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
        load: dependencies.load,
        resolve: dependencies.resolve,
        include: dependencies.include,
    });
}
