/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "@whiteeclipse/cache";
import { createIndexedDbCacheAdapter } from "@whiteeclipse/cache/indexeddb";
import type { CompilerCacheConfiguration } from "../../types";
import { DEFAULT_COMPILER_CACHE_CONFIGURATION } from "./configuration";


/**
 * Creates the browser's secondary storage tier.
 *
 * @param configuration Compiler cache options.
 * @returns An IndexedDB cache that closes its connection and deletes its database on disposal.
 * @rejects If IndexedDB is unavailable or the database cannot be opened.
 */
export async function createSecondaryCache(configuration: CompilerCacheConfiguration): Promise<CacheAdapter> {
    return createIndexedDbCacheAdapter(
        configuration.databaseName ?? DEFAULT_COMPILER_CACHE_CONFIGURATION.databaseName,
        { deleteOnDispose: true },
    );
}
