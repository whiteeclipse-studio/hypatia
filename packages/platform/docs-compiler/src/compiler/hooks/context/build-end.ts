/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BuildEndHookContext, HookContext } from "../../../types/index.js";


/**
 * Creates the context for buildEnd hooks.
 *
 * @param context Shared compilation services.
 * @returns A frozen context with a buildEnd child logger.
 */
export function createBuildEndHookContext(context: HookContext): BuildEndHookContext {
    return Object.freeze({
        logger: context.logger.getChild("buildEnd"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
    });
}
