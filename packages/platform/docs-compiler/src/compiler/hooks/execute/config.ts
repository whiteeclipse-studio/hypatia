/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompilerConfiguration, ConfigHookContext, ResolvedCompilerConfiguration } from "../../../types/index.js";
import { derivePluginContextLogger } from "../context/index.js";
import { mergeCompilationConfiguration } from "../../configuration.js";


/**
 * Runs config hooks in plugin order and merges their option updates.
 *
 * @param configuration Initial options; plugins and watch mode stay fixed.
 * @param context Configuration services.
 * @returns The updated configuration.
 * @rejects If cancelled or a hook fails.
 */
export async function executeConfigHook(
    configuration: CompilerConfiguration,
    context: ConfigHookContext,
): Promise<ResolvedCompilerConfiguration> {
    const plugins = Object.freeze([...(configuration.plugins ?? [])]);
    let current: ResolvedCompilerConfiguration = Object.freeze({
        ...mergeCompilationConfiguration(configuration, {}),
        plugins,
    });

    context.signal.throwIfAborted();
    for (const plugin of plugins) {
        context.signal.throwIfAborted();
        if (plugin.config === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running config hook.");
        const update = await plugin.config.call(pluginContext, current);
        context.signal.throwIfAborted();
        if (update === undefined) {
            continue;
        }

        current = Object.freeze({
            ...mergeCompilationConfiguration(current, {
                repositories: update.repositories ?? current.repositories,
                ...(update.cache === undefined ? {} : { cache: update.cache }),
            }),
            plugins,
        });
    }
    return current;
}
