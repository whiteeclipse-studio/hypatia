/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { LoaderState } from "./loader-state";


/**
 * Records a dependency before awaiting shared work, rejecting cycles between requests.
 *
 * @param parent Requesting source identity.
 * @param child Requested dependency identity.
 * @param state Shared state for this build attempt.
 * @throws {Error} If the dependency would form a cycle.
 */
export function recordDependency(parent: string, child: string, state: LoaderState): void {
    if (hasDependencyPath(child, parent, state, new Set())) {
        throw new Error(`Cyclic source dependency while loading ${child}.`);
    }
    const dependencies = state.edges.get(parent) ?? new Set<string>();
    dependencies.add(child);
    state.edges.set(parent, dependencies);
    observeDependency(parent, child, state);
}

/**
 * Tracks invalidation without imposing an awaiting relationship.
 *
 * @param parent Observing source.
 * @param child Resolved or included target.
 * @param state Current build.
 */
export function observeDependency(parent: string, child: string, state: LoaderState): void {
    const dependencies = state.dependencies.get(parent) ?? new Set<string>();
    dependencies.add(child);
    state.dependencies.set(parent, dependencies);
}

/**
 * Checks whether dependency links lead from a source to a target, including the source itself.
 * Uses current build links when available, otherwise links from unaffected previous records.
 *
 * @param source Source identity being visited.
 * @param target Source identity whose reachability would establish a cycle.
 * @param state Shared state for this build attempt.
 * @param visited Source identities already explored during this search.
 * @returns Whether the target is reachable from the source.
 */
function hasDependencyPath(source: string, target: string, state: LoaderState, visited: Set<string>): boolean {
    if (source === target) {
        return true;
    }

    if (visited.has(source)) {
        return false;
    }
    visited.add(source);

    // Retained watch dependencies can contain inclusion cycles, but do not await work.
    const dependencies = state.edges.get(source);
    return [...(dependencies ?? [])].some(child => hasDependencyPath(child, target, state, visited));
}
