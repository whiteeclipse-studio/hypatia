/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "@whiteeclipse/cache";
import { createAggregateCacheAdapter } from "@whiteeclipse/cache/aggregate";
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";
import { createSecondaryCache } from "#compiler-cache-secondary";
import type { CompilerCacheConfiguration } from "../../types/index.js";
import { DEFAULT_COMPILER_CACHE_CONFIGURATION } from "./configuration.js";


export { DEFAULT_COMPILER_CACHE_CONFIGURATION };

/**
 * Creates one shared cache with LRU memory followed by environment-specific storage.
 *
 * @param configuration Memory budget and secondary storage options.
 * @returns A compilation-owned aggregate cache.
 * @rejects If the budget is invalid or secondary storage cannot be initialized.
 */
export async function createCompilerCache(configuration: CompilerCacheConfiguration = {}): Promise<CacheAdapter> {
    const memory = createLruMemoryCacheAdapter(
        configuration.memoryMaxBytes ?? DEFAULT_COMPILER_CACHE_CONFIGURATION.memoryMaxBytes,
    );
    try {
        const secondary = await createSecondaryCache(configuration);
        return createAggregateCacheAdapter(memory, secondary);
    } catch (error) {
        await memory[Symbol.asyncDispose]();
        throw error;
    }
}
