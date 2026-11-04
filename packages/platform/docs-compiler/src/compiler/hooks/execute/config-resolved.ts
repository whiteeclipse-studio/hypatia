/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ConfigResolvedHookContext, ResolvedCompilerConfiguration } from "../../../types";
import { derivePluginContextLogger } from "../context";


/**
 * Runs configResolved hooks in plugin order with the final options.
 *
 * @param configuration Resolved compiler options.
 * @param context Hook services.
 * @returns Completion of all hooks.
 * @rejects If cancelled or a hook fails.
 */
export async function executeConfigResolvedHook(
    configuration: ResolvedCompilerConfiguration,
    context: ConfigResolvedHookContext,
): Promise<void> {
    context.signal.throwIfAborted();
    for (const plugin of configuration.plugins) {
        context.signal.throwIfAborted();
        if (plugin.configResolved === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running configResolved hook.");
        await plugin.configResolved.call(pluginContext, configuration);
        context.signal.throwIfAborted();
    }
}
