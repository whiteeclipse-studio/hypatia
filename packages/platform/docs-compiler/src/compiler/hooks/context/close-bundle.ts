/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CloseBundleHookContext, HookContext } from "../../../types";


/**
 * Creates the context for closeBundle hooks.
 *
 * @param context Shared compilation services.
 * @returns A frozen context with a closeBundle child logger.
 */
export function createCloseBundleHookContext(context: HookContext): CloseBundleHookContext {
    return Object.freeze({
        logger: context.logger.getChild("closeBundle"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
    });
}
