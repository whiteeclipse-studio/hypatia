/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, ResolveIdHookContext } from "../../../types";


/**
 * Creates the context for resolveId hooks.
 *
 * @param context Shared compilation services.
 * @returns A frozen context with a resolveId child logger.
 */
export function createResolveIdHookContext(context: HookContext): ResolveIdHookContext {
    return Object.freeze({
        logger: context.logger.getChild("resolveId"),
        signal: context.signal,
        cache: context.cache,
        watch: context.watch,
        onDispose: context.onDispose,
    });
}
