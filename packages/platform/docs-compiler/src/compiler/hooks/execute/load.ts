/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompilationResult, LoadHookContext, Reference, ResolvedCompilerConfiguration } from "../../../types";
import { derivePluginContextLogger } from "../context";


/**
 * Runs load hooks until a plugin handles the reference.
 *
 * @param reference Source to load.
 * @param configuration Compiler options.
 * @param context Hook services.
 * @returns The first representation, or undefined if unhandled.
 * @rejects If cancelled or a hook fails.
 */
export async function executeLoadHook(
    reference: Reference,
    configuration: ResolvedCompilerConfiguration,
    context: LoadHookContext,
): Promise<CompilationResult | undefined> {
    context.signal.throwIfAborted();
    for (const plugin of configuration.plugins) {
        context.signal.throwIfAborted();
        if (plugin.load === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running load hook.");
        const value = await plugin.load.call(pluginContext, reference);
        context.signal.throwIfAborted();
        if (value === undefined) {
            continue;
        }
        return value;
    }
    return undefined;
}
