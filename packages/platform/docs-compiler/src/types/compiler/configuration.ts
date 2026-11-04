/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompilerCacheConfiguration } from "./cache";
import type { CompilerPlugin } from "./plugin";


/** Source location interpreted by a resolver. */
export type Input = string | URL;

/** Sources and options for a compilation request. */
interface BaseCompilerConfiguration {
    /** One repository source or a list of repository sources. */
    readonly repositories: Input | readonly Input[];
    /** Plugins in hook execution order. */
    readonly plugins?: readonly CompilerPlugin[];
    /** Options for the cache owned by the compilation. */
    readonly cache?: CompilerCacheConfiguration;
}

/** Configuration for a single compilation. */
export interface CompileConfiguration extends BaseCompilerConfiguration {
    /** Omitted or false for a single compilation. */
    readonly watch?: false;
}

/** Configuration for a stream of replacement snapshots. */
export interface WatchConfiguration extends BaseCompilerConfiguration {
    /** Enables watching for source changes. */
    readonly watch: true;
}

/** Configuration discriminated by whether compilation watches its inputs. */
export type CompilerConfiguration = CompileConfiguration | WatchConfiguration;

/** Compiler options with the plugin list initialized. */
export type ResolvedCompilerConfiguration = CompilerConfiguration & {
    readonly plugins: readonly CompilerPlugin[];
};
