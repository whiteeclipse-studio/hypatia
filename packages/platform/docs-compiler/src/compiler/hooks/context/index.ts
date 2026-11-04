/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BaseHookContext, CompilerPlugin } from "../../../types";


export * from "./config";
export * from "./config-resolved";
export * from "./build-start";
export * from "./resolve-id";
export * from "./load";
export * from "./transform";
export * from "./build-end";
export * from "./close-bundle";

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
