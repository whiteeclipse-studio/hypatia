/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ConfigHook } from "./config.js";
import type { ConfigResolvedHook } from "./config-resolved.js";
import type { BuildStartHook } from "./build-start.js";
import type { ResolveIdHook } from "./resolve-id.js";
import type { LoadHook } from "./load.js";
import type { TransformHook } from "./transform.js";
import type { BuildEndHook } from "./build-end.js";
import type { CloseBundleHook } from "./close-bundle.js";


export type * from "./config.js";
export type * from "./config-resolved.js";
export type * from "./context.js";
export type * from "./build-start.js";
export type * from "./resolve-id.js";
export type * from "./load.js";
export type * from "./transform.js";
export type * from "./build-end.js";
export type * from "./close-bundle.js";

/** A named participant in the compilation pipeline. */
export interface CompilerPlugin {
    /** Diagnostic name identifying the plugin. */
    readonly name: string;
    /** Updates options before sources are processed. */
    readonly config?: ConfigHook;
    /** Receives the final compiler options. */
    readonly configResolved?: ConfigResolvedHook;
    /** Initializes resources before source resolution. */
    readonly buildStart?: BuildStartHook;
    /** Maps a source identifier to a reference. */
    readonly resolveId?: ResolveIdHook;
    /** Supplies the initial artifact or repository. */
    readonly load?: LoadHook;
    /** Transforms the loaded representation. */
    readonly transform?: TransformHook;
    /** Runs after all transformations on successful builds. */
    readonly buildEnd?: BuildEndHook;
    /** Writes outputs when the pipeline finishes on successful builds. */
    readonly closeBundle?: CloseBundleHook;
}
