/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "@whiteeclipse/cache";
import { createFileSystemCacheAdapter } from "@whiteeclipse/cache/filesystem";
import type { CompilerCacheConfiguration } from "../../types/index.js";


/**
 * Creates the server's secondary storage tier.
 *
 * @param configuration Compiler cache options.
 * @returns A temporary filesystem cache.
 * @rejects If the temporary directory cannot be created.
 */
export async function createSecondaryCache(configuration: CompilerCacheConfiguration): Promise<CacheAdapter> {
    return createFileSystemCacheAdapter(configuration.directory);
}
