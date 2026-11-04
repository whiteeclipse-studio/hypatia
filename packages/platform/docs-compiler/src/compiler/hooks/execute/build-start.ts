/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BuildStartHookContext, ResolvedCompilerConfiguration } from "../../../types";
import { derivePluginContextLogger } from "../context";


/**
 * Runs buildStart hooks in plugin order with the final options.
 *
 * @param configuration Resolved compiler options.
 * @param context Hook services.
 * @returns Completion of all hooks.
 * @rejects If cancelled or a hook fails.
 */
export async function executeBuildStartHook(
    configuration: ResolvedCompilerConfiguration,
    context: BuildStartHookContext,
): Promise<void> {
    context.signal.throwIfAborted();
    for (const plugin of configuration.plugins) {
        context.signal.throwIfAborted();
        if (plugin.buildStart === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running buildStart hook.");
        await plugin.buildStart.call(pluginContext, configuration);
        context.signal.throwIfAborted();
    }
}
