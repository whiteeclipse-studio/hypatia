/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BuildStartHookContext, HookContext } from "../../../types/index.js";


/**
 * Creates the context for buildStart hooks.
 *
 * @param context Shared compilation services.
 * @returns A frozen context with a buildStart child logger.
 */
export function createBuildStartHookContext(context: HookContext): BuildStartHookContext {
    return Object.freeze({
        logger: context.logger.getChild("buildStart"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
    });
}
