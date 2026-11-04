/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Input } from "../configuration.js";
import type { Reference } from "../reference.js";
import type { HookContext } from "./context.js";


/** Services available during source resolution. */
export type ResolveIdHookContext = HookContext;

/** Identifies a source, or returns undefined for the next plugin to handle it. */
export type ResolveIdHook = (
    this: ResolveIdHookContext,
    id: Input,
    importer?: Reference,
) => Promisable<Reference | undefined>;
