/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CloseBundleHookContext, Repository, ResolvedCompilerConfiguration } from "../../../types";
import { derivePluginContextLogger } from "../context";


/**
 * Runs closeBundle hooks in plugin order on completed repositories.
 *
 * @param repositories Transformed repositories.
 * @param configuration Resolved compiler options.
 * @param context Hook services.
 * @returns Completion of all hooks.
 * @rejects If cancelled or a hook fails.
 */
export async function executeCloseBundleHook(
    repositories: readonly Repository[],
    configuration: ResolvedCompilerConfiguration,
    context: CloseBundleHookContext,
): Promise<void> {
    context.signal.throwIfAborted();
    for (const plugin of configuration.plugins) {
        context.signal.throwIfAborted();
        if (plugin.closeBundle === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running closeBundle hook.");
        await plugin.closeBundle.call(pluginContext, repositories);
        context.signal.throwIfAborted();
    }
}
