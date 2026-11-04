/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Reference } from "../reference.js";
import type { CompilationResult } from "../value.js";
import type { LoadHookContext } from "./load.js";


/** Services available during transformation. */
export type TransformHookContext = LoadHookContext;

/** Returns a replacement, or undefined to preserve the current value. */
export type TransformHook = (
    this: TransformHookContext,
    value: CompilationResult,
    reference: Reference,
) => Promisable<CompilationResult | undefined>;
