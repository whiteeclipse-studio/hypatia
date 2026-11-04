/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ArtifactReference, CompilationResult, HookContext, LoadHookContext, Reference } from "../../../types";
import { createLoadHookContext, executeResolveIdHook } from "../../hooks";
import { getReferenceKey } from "../reference";
import { observeDependency, recordDependency } from "./dependencies";
import { registerReference } from "./references";
import type { LoaderState } from "./loader-state";


/**
 * Queues an immutable source without starting or awaiting its transformation.
 *
 * @param reference Included artifact.
 * @param state Current build.
 * @returns The captured reference retained by the queue.
 * @throws {TypeError} If supplied a non-artifact at runtime.
 */
export function queueInclusion(reference: ArtifactReference, state: LoaderState): ArtifactReference {
    const captured = registerReference(reference, state);
    if (captured.type !== "artifact") {
        throw new TypeError("Only artifact sources can be included.");
    }
    state.included.set(getReferenceKey(captured), captured);
    return captured;
}

/**
 * Binds dependency services to the requesting source.
 *
 * @param reference Requesting source.
 * @param state Current build.
 * @param tracking Collects subscriptions and inclusions for watch replay.
 * @param tracking.watches Retained subscription identities.
 * @param tracking.included Queued artifact references.
 * @param load Executes a resolved source's full pipeline.
 * @returns Frozen source-local hook services.
 */
export function createSourceContext(
    reference: Reference,
    state: LoaderState,
    tracking: { watches: Set<string>; included: ArtifactReference[] },
    load: (source: Reference) => Promise<CompilationResult>,
): LoadHookContext {
    const key = getReferenceKey(reference);
    const repositoryId = reference.type === "repository" ? reference.id : reference.id.repositoryId;
    const services: HookContext = {
        ...state.context,
        async watch(watched, subscribe) {
            const watchedKey = getReferenceKey(watched);
            if (watchedKey !== key) {
                observeDependency(key, watchedKey, state);
            }
            tracking.watches.add(watchedKey);
            await state.context.watch(watched, subscribe);
        },
    };
    const dependencies: Pick<LoadHookContext, "load" | "resolve" | "include"> = {
        async load(input) {
            const child = await dependencies.resolve(input);
            if (child === undefined) {
                throw new Error(`Unable to resolve ${String(input)} imported by ${key}.`);
            }
            recordDependency(key, getReferenceKey(child), state);
            return load(child);
        },
        async resolve(input) {
            const child = await executeResolveIdHook(input, state.configuration, state.resolveContext, reference);
            if (child === undefined) {
                return undefined;
            }
            const captured = registerReference(child, state);
            observeDependency(key, getReferenceKey(captured), state);
            return captured;
        },
        include(child) {
            state.context.signal.throwIfAborted();
            if (child.id.repositoryId !== repositoryId) {
                throw new TypeError("Included artifacts must belong to the requesting repository.");
            }
            const captured = queueInclusion(child, state);
            observeDependency(key, getReferenceKey(child), state);
            tracking.included.push(captured);
        },
    };
    return createLoadHookContext(services, dependencies);
}
