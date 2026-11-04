/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Reference } from "../../types/index.js";


/**
 * Identifies a source without interpreting its opaque ID or version.
 *
 * @param reference Source reference.
 * @returns A repository-scoped identity key.
 */
export function getReferenceKey(reference: Reference): string {
    switch (reference.type) {
        case "repository":
            return JSON.stringify([reference.type, reference.id]);
        case "artifact":
            return JSON.stringify([reference.type, reference.id.repositoryId, reference.id.path]);
    }
}

/**
 * Clones a reference and freezes its identity and version.
 *
 * @param reference Plugin reference.
 * @returns An independent frozen identity and version.
 */
export function cloneReference(reference: Reference): Reference {
    switch (reference.type) {
        case "repository":
            return Object.freeze({ ...reference });
        case "artifact":
            return Object.freeze({ ...reference, id: Object.freeze({ ...reference.id }) });
    }
}
