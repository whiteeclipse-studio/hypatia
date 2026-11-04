/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";
import type { Repository } from "../../repository";
import type { HookContext } from "./context";


/** Services available when the pipeline finishes. */
export type CloseBundleHookContext = HookContext;

/** Receives completed repositories for output writing before snapshot handoff. */
export type CloseBundleHook = (this: CloseBundleHookContext, repositories: readonly Repository[]) => Promisable<void>;
