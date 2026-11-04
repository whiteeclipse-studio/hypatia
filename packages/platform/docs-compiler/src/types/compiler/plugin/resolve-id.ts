/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Input } from "../configuration";
import type { Reference } from "../reference";
import type { HookContext } from "./context";


/** Services available during source resolution. */
export type ResolveIdHookContext = HookContext;

/** Identifies a source, or returns undefined for the next plugin to handle it. */
export type ResolveIdHook = (
    this: ResolveIdHookContext,
    id: Input,
    importer?: Reference,
) => Promisable<Reference | undefined>;
