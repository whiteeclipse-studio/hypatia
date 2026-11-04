/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Defaults for compiler-owned storage; the filesystem directory is chosen by its backend. */
export const DEFAULT_COMPILER_CACHE_CONFIGURATION = Object.freeze({
    memoryMaxBytes: 104_857_600,
    databaseName: "@whiteeclipse/docs-compiler-cache",
});
