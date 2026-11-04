/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ResolvedCompilerConfiguration } from "../configuration.js";
import type { Promisable } from "type-fest";
import type { HookContext } from "./context.js";


/** Services available after configuration. */
export type ConfigResolvedHookContext = HookContext;

/** Receives the final options without returning updates. */
export type ConfigResolvedHook = (
    this: ConfigResolvedHookContext,
    configuration: ResolvedCompilerConfiguration,
) => Promisable<void>;
