/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BaseHookContext, CompilerPlugin } from "../../../types/index.js";


export * from "./config.js";
export * from "./config-resolved.js";
export * from "./build-start.js";
export * from "./resolve-id.js";
export * from "./load.js";
export * from "./transform.js";
export * from "./build-end.js";
export * from "./close-bundle.js";

/**
 * Copies a hook context with a logger scoped to the current plugin.
 *
 * @param context Hook services to preserve.
 * @param plugin Plugin whose name identifies the child logger.
 * @returns A frozen context with the same services and a plugin child logger.
 */
export function derivePluginContextLogger<Context extends BaseHookContext>(
    context: Context,
    plugin: CompilerPlugin,
): Readonly<Context> {
    return Object.freeze({ ...context, logger: context.logger.getChild(plugin.name) });
}
