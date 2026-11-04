/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type {
    ArtifactReference,
    CompilationResult,
    HookContext,
    ResolvedCompilerConfiguration,
    ResolveIdHookContext,
} from "../../../types";
import type { IncrementalBuild } from "../incremental";


/** Shared request state for one pipeline invocation; owns no external resources. */
export interface LoaderState {
    /** Final configuration used by resolution, loading, and transformation hooks. */
    readonly configuration: ResolvedCompilerConfiguration;
    /** Borrowed build services and compiler-owned cleanup registration. */
    readonly context: HookContext;
    /** Optional scratch records for incremental reuse and replacement. */
    readonly incremental: IncrementalBuild | undefined;
    /** In-flight and successful source requests shared within this build attempt. */
    readonly pending: Map<string, Promise<CompilationResult>>;
    /** Requested version for each source identity, used to reject conflicting versions. */
    readonly versions: Map<string, string | undefined>;
    /** Dependencies discovered while processing sources in this attempt. */
    readonly edges: Map<string, Set<string>>;
    /** Watch dependencies, including non-awaiting resolution and inclusion edges. */
    readonly dependencies: Map<string, Set<string>>;
    /** Artifact references queued for inclusion, deduplicated by source identity. */
    readonly included: Map<string, ArtifactReference>;
    /** Resolution services reused for child requests, with each importer supplied separately. */
    readonly resolveContext: ResolveIdHookContext;
}
