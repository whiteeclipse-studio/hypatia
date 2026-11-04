/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Repository } from "../../repository.js";
import type { HookContext } from "./context.js";


/** Services available after all transformations. */
export type BuildEndHookContext = HookContext;

/** Receives completed repositories for final build processing. */
export type BuildEndHook = (this: BuildEndHookContext, repositories: readonly Repository[]) => Promisable<void>;
