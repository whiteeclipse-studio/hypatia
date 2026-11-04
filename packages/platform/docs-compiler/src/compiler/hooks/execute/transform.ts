/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type {
    CompilationResult,
    Reference,
    ResolvedCompilerConfiguration,
    TransformHookContext,
} from "../../../types/index.js";
import { derivePluginContextLogger } from "../context/index.js";


/**
 * Runs transform hooks in plugin order.
 *
 * @param value Initial representation.
 * @param reference Source being transformed.
 * @param configuration Resolved compiler options.
 * @param context Hook services.
 * @returns The final value, preserving it when a hook returns undefined.
 * @rejects If cancelled or a hook fails.
 */
export async function executeTransformHook(
    value: CompilationResult,
    reference: Reference,
    configuration: ResolvedCompilerConfiguration,
    context: TransformHookContext,
): Promise<CompilationResult> {
    let current = value;
    context.signal.throwIfAborted();
    for (const plugin of configuration.plugins) {
        context.signal.throwIfAborted();
        if (plugin.transform === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running transform hook.");
        const replacement = await plugin.transform.call(pluginContext, current, reference);
        context.signal.throwIfAborted();
        if (replacement === undefined) {
            continue;
        }
        current = replacement;
    }
    return current;
}
