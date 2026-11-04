/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

export { type AggregateCacheAdapter, createAggregateCacheAdapter } from "./aggregate.js";
export { type FileSystemCacheAdapter, createFileSystemCacheAdapter } from "./filesystem.js";
export {
    type IndexedDbCacheAdapter,
    type IndexedDbCacheAdapterOptions,
    createIndexedDbCacheAdapter,
} from "./indexeddb.js";
export { type LruMemoryCacheAdapter, createLruMemoryCacheAdapter } from "./memory.js";
export { type ReferenceCountedCacheAdapter, createReferenceCountedCacheAdapter } from "./reference-counted.js";
