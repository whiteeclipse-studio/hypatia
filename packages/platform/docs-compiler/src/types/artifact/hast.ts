/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import { assert } from "hast-util-assert";


/**
 * Checks for a HAST root using the ecosystem assertion helper.
 *
 * @param value Tree to validate, including its descendants.
 * @returns Whether the value is a structurally valid HAST root.
 */
export function isHastRoot(value: unknown): value is Root {
    try {
        assert(value);
        return value.type === "root";
    } catch {
        return false;
    }
}
