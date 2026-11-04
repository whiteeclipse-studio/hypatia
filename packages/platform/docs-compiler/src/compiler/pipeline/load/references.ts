/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Reference } from "../../../types/index.js";
import { LogicalPathSchema } from "../../../paths.js";
import { cloneReference, getReferenceKey } from "../reference.js";
import type { LoaderState } from "./loader-state.js";


/**
 * Captures a source and enforces consistent versions and normalized logical identities.
 *
 * @param source Plugin-supplied identity.
 * @param state Current build.
 * @returns An independent frozen reference.
 * @throws {Error} If the source has conflicting versions or a non-normalized path.
 */
export function registerReference(source: Reference, state: LoaderState): Reference {
    const reference = cloneReference(source);
    const key = getReferenceKey(reference);
    if (state.versions.has(key) && state.versions.get(key) !== reference.version) {
        throw new Error(`Conflicting source versions for ${key}.`);
    }
    state.versions.set(key, reference.version);
    if (reference.type === "artifact") {
        if (LogicalPathSchema.parse(reference.id.path) !== reference.id.path) {
            throw new Error(`Expected a normalized logical path for ${key}.`);
        }
    }
    return reference;
}
