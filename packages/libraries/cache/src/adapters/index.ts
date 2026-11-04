/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

export { type AggregateCacheAdapter, createAggregateCacheAdapter } from "./aggregate";
export { type FileSystemCacheAdapter, createFileSystemCacheAdapter } from "./filesystem";
export {
    type IndexedDbCacheAdapter,
    type IndexedDbCacheAdapterOptions,
    createIndexedDbCacheAdapter,
} from "./indexeddb";
export { type LruMemoryCacheAdapter, createLruMemoryCacheAdapter } from "./memory";
export { type ReferenceCountedCacheAdapter, createReferenceCountedCacheAdapter } from "./reference-counted.ts";
