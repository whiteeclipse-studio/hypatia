/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ResolvedCompilerConfiguration } from "../configuration";
import type { Promisable } from "type-fest";
import type { HookContext } from "./context";


/** Services available when a build starts. */
export type BuildStartHookContext = HookContext;

/** Initializes resources before source resolution. */
export type BuildStartHook = (
    this: BuildStartHookContext,
    configuration: ResolvedCompilerConfiguration,
) => Promisable<void>;
