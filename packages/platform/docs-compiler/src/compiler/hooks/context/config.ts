/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BaseHookContext, ConfigHookContext } from "../../../types";


/**
 * Creates the context for configuration hooks.
 *
 * @param context Shared compilation services.
 * @returns A frozen context with a config child logger.
 */
export function createConfigHookContext(context: BaseHookContext): ConfigHookContext {
    return Object.freeze({
        logger: context.logger.getChild("config"),
        signal: context.signal,
        onDispose: context.onDispose,
    });
}
