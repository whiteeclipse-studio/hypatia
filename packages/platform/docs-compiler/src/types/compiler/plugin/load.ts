/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Input } from "../configuration";
import type { ArtifactReference, Reference } from "../reference";
import type { CompilationResult } from "../value";
import type { HookContext } from "./context";


/** Services available during loading. */
export interface LoadHookContext extends HookContext {
    /**
     * Resolves relative to the current source without loading or transforming the target.
     *
     * @param input Authored source destination.
     * @returns A frozen reference, or undefined when no resolver handles it.
     * @rejects If resolution fails or compilation is cancelled.
     */
    resolve(this: void, input: Input): Promise<Reference | undefined>;

    /**
     * Queues an artifact for loading and repository inclusion without awaiting its transforms.
     * Mutual inclusion and self-inclusion are allowed; repeated identities are deduplicated.
     *
     * @param reference Resolved artifact in the current repository.
     * @throws {TypeError} If the reference belongs to another repository.
     */
    include(this: void, reference: ArtifactReference): void;

    /**
     * Resolves, loads, and transforms a child source.
     *
     * @param input Source identifier interpreted by plugins.
     * @returns The child's final representation.
     * @rejects If compilation fails or a dependency cycle is found.
     */
    load(this: void, input: Input): Promise<CompilationResult>;
}

/** Supplies an initial representation, or delegates with undefined. */
export type LoadHook = (this: LoadHookContext, reference: Reference) => Promisable<CompilationResult | undefined>;
