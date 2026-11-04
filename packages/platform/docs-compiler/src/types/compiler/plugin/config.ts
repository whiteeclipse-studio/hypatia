/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompilerConfiguration } from "../configuration.js";
import type { Promisable } from "type-fest";
import type { BaseHookContext } from "./context.js";


/** Services available during configuration. */
export type ConfigHookContext = BaseHookContext;

/** Returns option updates, or undefined to keep the current options. */
export type ConfigHook = (
    this: ConfigHookContext,
    configuration: CompilerConfiguration,
) => Promisable<Partial<Omit<CompilerConfiguration, "plugins" | "watch">> | undefined>;
