/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Input, Reference, ResolvedCompilerConfiguration, ResolveIdHookContext } from "../../../types/index.js";
import { derivePluginContextLogger } from "../context/index.js";


/**
 * Runs resolveId hooks until a plugin handles the source.
 *
 * @param id Source identifier, passed through unchanged.
 * @param configuration Compiler options.
 * @param context Hook services.
 * @param importer Source requesting the identifier, if any.
 * @returns The first reference, or undefined if unhandled.
 * @rejects If cancelled or a hook fails.
 */
export async function executeResolveIdHook(
    id: Input,
    configuration: ResolvedCompilerConfiguration,
    context: ResolveIdHookContext,
    importer?: Reference,
): Promise<Reference | undefined> {
    context.signal.throwIfAborted();
    for (const plugin of configuration.plugins) {
        context.signal.throwIfAborted();
        if (plugin.resolveId === undefined) {
            continue;
        }

        const pluginContext = derivePluginContextLogger(context, plugin);
        pluginContext.logger.trace("Running resolveId hook.");
        const reference = await plugin.resolveId.call(pluginContext, id, importer);
        context.signal.throwIfAborted();
        if (reference === undefined) {
            continue;
        }
        return reference;
    }
    return undefined;
}
