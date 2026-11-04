/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ConfigHook } from "./config";
import type { ConfigResolvedHook } from "./config-resolved";
import type { BuildStartHook } from "./build-start";
import type { ResolveIdHook } from "./resolve-id";
import type { LoadHook } from "./load";
import type { TransformHook } from "./transform";
import type { BuildEndHook } from "./build-end";
import type { CloseBundleHook } from "./close-bundle";


export type * from "./config";
export type * from "./config-resolved";
export type * from "./context";
export type * from "./build-start";
export type * from "./resolve-id";
export type * from "./load";
export type * from "./transform";
export type * from "./build-end";
export type * from "./close-bundle";

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
