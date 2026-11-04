/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Options for the compiler-owned aggregate cache. */
export interface CompilerCacheConfiguration {
    /** LRU content budget in bytes; defaults to 100 MiB. Zero disables memory retention. */
    readonly memoryMaxBytes?: number;
    /** Existing filesystem parent directory; defaults to the system temporary directory on servers. */
    readonly directory?: string;
    /** Dedicated IndexedDB database, deleted on disposal; defaults to whiteeclipse-docs-compiler. */
    readonly databaseName?: string;
}
