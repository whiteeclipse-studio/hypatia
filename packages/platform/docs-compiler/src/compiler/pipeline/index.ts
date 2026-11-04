/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, Repository, ResolvedCompilerConfiguration } from "../../types";
import {
    createBuildEndHookContext,
    createBuildStartHookContext,
    createResolveIdHookContext,
    executeBuildEndHook,
    executeBuildStartHook,
} from "../hooks";
import { resolveRepositories } from "./resolve";
import { loadRepositories } from "./load";
import type { IncrementalBuild } from "./incremental";


export { resolveRepositories, loadRepositories };

/**
 * Runs one build from buildStart through resolution, loading, transformation, and buildEnd.
 *
 * Borrows the cache, cancellation signal, and cleanup registration from compile.
 * The caller retains resource ownership on both success and failure.
 *
 * @param configuration Final compiler options reused for this build.
 * @param context Services and resource registration owned by compile.
 * @param incremental Optional compiler-owned incremental state.
 * @returns Transformed repositories in configuration order.
 * @rejects If cancelled or a pipeline stage fails.
 */
export async function runCompilerPipeline(
    configuration: ResolvedCompilerConfiguration,
    context: HookContext,
    incremental?: IncrementalBuild,
): Promise<readonly Repository[]> {
    await executeBuildStartHook(configuration, createBuildStartHookContext(context));

    const references = await resolveRepositories(configuration, createResolveIdHookContext(context));
    const repositories = await loadRepositories(references, configuration, context, incremental);

    await executeBuildEndHook(repositories, configuration, createBuildEndHookContext(context));
    return repositories;
}
