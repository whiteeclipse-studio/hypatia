/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type {
    ArtifactReference,
    CompilationResult,
    HookContext,
    Reference,
    Repository,
    RepositoryReference,
    ResolvedCompilerConfiguration,
} from "../../../types/index.js";
import {
    createResolveIdHookContext,
    createTransformHookContext,
    executeLoadHook,
    executeTransformHook,
} from "../../hooks/index.js";
import { getReferenceKey } from "../reference.js";
import { captureCompilationValue, type IncrementalBuild, retainRecord } from "../incremental.js";
import type { LoaderState } from "./loader-state.js";
import { createSourceContext, queueInclusion } from "./context.js";
import { registerReference } from "./references.js";
import { defer } from "../../defer.js";


/**
 * Loads and transforms requested sources, sharing requests and retaining unaffected watch records.
 *
 * @param references Repository sources.
 * @param configuration Compiler options.
 * @param context Borrowed build services.
 * @param incremental Optional compiler-owned watch state.
 * @returns Transformed repositories in input order.
 * @rejects If processing fails, source versions conflict, or a dependency cycle is found.
 */
export async function loadRepositories(
    references: readonly RepositoryReference[],
    configuration: ResolvedCompilerConfiguration,
    context: HookContext,
    incremental?: IncrementalBuild,
): Promise<readonly Repository[]> {
    const state: LoaderState = {
        configuration,
        context,
        incremental,
        pending: new Map(),
        versions: new Map(),
        edges: new Map(),
        dependencies: new Map(),
        included: new Map(),
        resolveContext: createResolveIdHookContext(context),
    };
    const repositories: Repository[] = [];
    for (const reference of references) {
        const value = await loadSource(reference, state);
        if (!("getArtifact" in value)) {
            throw new TypeError("Expected a repository representation.");
        }
        repositories.push(await includeArtifacts(value, reference, state));
    }
    return Object.freeze(repositories);
}

/**
 * Loads a source once per attempt, retaining its final watch result.
 *
 * @param source Source requested by a loader or configured input.
 * @param state Shared state for this build attempt.
 * @returns Its transformed representation.
 * @rejects If processing or source version consistency fails.
 */
async function loadSource(source: Reference, state: LoaderState): Promise<CompilationResult> {
    state.context.signal.throwIfAborted();

    const reference = registerReference(source, state);
    const key = getReferenceKey(reference);

    const existing = state.pending.get(key);
    if (existing !== undefined) {
        return existing;
    }

    const cached = state.incremental?.previous.get(key);
    if (
        state.incremental !== undefined &&
        cached !== undefined &&
        !state.incremental.invalidated.has(key) &&
        cached.reference.version === reference.version
    ) {
        retainRecord(cached, state.incremental, child => {
            queueInclusion(child, state);
        });
        return cached.value;
    }

    // Defer processing until the task is registered, so recursive loads can share it.
    const task = defer(async () => processSource(reference, state));
    state.pending.set(key, task);
    try {
        return await task;
    } catch (error) {
        state.pending.delete(key);
        state.edges.delete(key);
        state.dependencies.delete(key);
        throw error;
    }
}

/**
 * Executes hooks and captures a reusable result when watching.
 *
 * @param reference Source identity and version.
 * @param state Shared state for this build attempt.
 * @returns Final representation.
 * @rejects If hooks, dependency loading, or output capture fails.
 */
async function processSource(reference: Reference, state: LoaderState): Promise<CompilationResult> {
    const { configuration, incremental } = state;
    const key = getReferenceKey(reference);
    const watches = new Set<string>();
    const included: ArtifactReference[] = [];
    state.edges.set(key, new Set());
    state.dependencies.set(key, new Set());
    const loading = createSourceContext(reference, state, { watches, included }, async child =>
        loadSource(child, state),
    );

    const initial = await executeLoadHook(reference, configuration, loading);
    if (initial === undefined) {
        throw new Error(`No plugin could load ${key}.`);
    }
    assertKind(initial, reference);

    const transformed = await executeTransformHook(
        initial,
        reference,
        configuration,
        createTransformHookContext(loading, loading),
    );
    assertKind(transformed, reference);

    if (incremental === undefined) {
        return transformed;
    }
    const payloadKeys = new Set<string>();
    const value = captureCompilationValue(transformed, incremental.readPayload, payloadKeys);
    incremental.records.set(key, {
        reference,
        value,
        dependencies: state.dependencies.get(key) ?? new Set(),
        watches,
        payloadKeys,
        included,
    });
    return value;
}

/**
 * Checks source kind without interpreting plugin-specific artifact types.
 *
 * @param value Plugin result.
 * @param reference Expected source kind.
 * @throws {TypeError} If the representation has the wrong kind.
 */
function assertKind(value: CompilationResult, reference: Reference): void {
    if (reference.type === "repository") {
        if (!("getArtifact" in value)) {
            throw new TypeError(`Unexpected representation for ${getReferenceKey(reference)}.`);
        }
        return;
    }
    if (!("read" in value)) {
        throw new TypeError(`Unexpected representation for ${getReferenceKey(reference)}.`);
    }
    if (value.path !== reference.id.path) {
        throw new TypeError(`Transforms must preserve resolved path ${reference.id.path}.`);
    }
}

/**
 * Drains queued inclusions after the repository transform, then exposes their final artifacts.
 * Map iteration admits newly queued targets, including mutually linked documents, once each.
 *
 * @param repository Transformed inventory.
 * @param reference Owning repository source.
 * @param state Current build.
 * @returns An inventory containing the transitive closure of queued artifacts.
 * @rejects If an included source fails or returns an inconsistent artifact path.
 */
async function includeArtifacts(
    repository: Repository,
    reference: RepositoryReference,
    state: LoaderState,
): Promise<Repository> {
    const artifacts = new Map(repository);
    for (const child of state.included.values()) {
        if (child.id.repositoryId !== reference.id) {
            continue;
        }
        const value = await loadSource(child, state);
        if (!("read" in value)) {
            throw new TypeError("Expected an included artifact.");
        }
        // The repository and this request use the same identity: repository source plus path.
        artifacts.set(value.path, value);
    }
    return Object.freeze({
        id: repository.id,
        name: repository.name,
        metadata: repository.metadata,
        getArtifact: (path: string) => artifacts.get(path),
        [Symbol.iterator]: () => artifacts.entries(),
    });
}
