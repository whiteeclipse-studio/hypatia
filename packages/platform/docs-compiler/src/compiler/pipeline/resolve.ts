/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { RepositoryReference, ResolvedCompilerConfiguration, ResolveIdHookContext } from "../../types";
import { executeResolveIdHook } from "../hooks";


/**
 * Resolves the configured repository sources.
 *
 * @param configuration Resolved compiler options.
 * @param context Resolution services.
 * @returns Repository references in configuration order.
 * @rejects If a source is unhandled, resolves to an artifact, or resolution fails.
 */
export async function resolveRepositories(
    configuration: ResolvedCompilerConfiguration,
    context: ResolveIdHookContext,
): Promise<readonly RepositoryReference[]> {
    const repositories: RepositoryReference[] = [];
    context.signal.throwIfAborted();
    for (const id of [configuration.repositories].flat()) {
        const reference = await executeResolveIdHook(id, configuration, context);
        if (reference === undefined) {
            throw new Error(`Unable to resolve repository ${String(id)}.`);
        }
        if (reference.type !== "repository") {
            throw new Error(`Expected a repository reference for ${String(id)}.`);
        }
        repositories.push(reference);
    }
    return Object.freeze(repositories);
}
