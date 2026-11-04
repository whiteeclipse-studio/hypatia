/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ConfigResolvedHookContext, HookContext } from "../../../types/index.js";


/**
 * Creates the context for configResolved hooks.
 *
 * @param context Shared compilation services.
 * @returns A frozen context with a configResolved child logger.
 */
export function createConfigResolvedHookContext(context: HookContext): ConfigResolvedHookContext {
    return Object.freeze({
        logger: context.logger.getChild("configResolved"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
    });
}
