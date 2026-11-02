---
id: cache-documentation
standard_revision: 1
---

# @whiteeclipse/cache

A cache keeps reusable copies of data under keys so consumers can avoid repeating expensive work, such as reading a
file, fetching a resource, or compiling a document. A cache hit returns a stored copy; a cache miss means the consumer
must obtain or rebuild it. Cached data can disappear, so consumers need a source or recovery strategy for data they
still require.

`@whiteeclipse/cache` stores `Blob` values under opaque string keys. It provides storage adapters and JSON conversion
helpers; consumers choose keys, load missing data, and decide when contents are stale.

This documentation covers the private workspace version `0.1.0-alpha.1`. It describes the current implementation, which
remains exploratory pre-production work associated with [RFC-0005](../../rfcs/0005-documentation-publication.md).

## Start here

See the [package README](https://npmjs.org/package/@whiteeclipse/cache) for workspace setup, a minimal example, JSON
helpers, and development commands.

- [Contract and guarantees](./contract.md): Keys, operations, errors, ordering, and borrowed Blob lifetimes.
- [LRU memory](./memory.md): Bounded retained content with least-recently-used eviction.
- [Filesystem](./filesystem.md): Temporary file storage and lazy file-backed reads.
- [IndexedDB](./indexeddb.md): Browser storage that can outlive an adapter connection.
- [Aggregate](./aggregate.md): Ordered reads and replication across owned child caches.

## Choose an adapter

| Variant    | Storage and retention                                         | Useful when                                                                                  |
|------------|---------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| LRU memory | Memory; evicts entries to fit a byte budget                   | Repeated access benefits from keeping a bounded amount of content in memory                  |
| Filesystem | A fresh temporary directory; removed on disposal              | Large payloads should be read without eagerly loading their bytes into JavaScript buffers    |
| IndexedDB  | A named browser database; entries survive connection disposal | Cached content should be reusable across browser sessions, subject to browser storage policy |
| Aggregate  | Child adapters determine storage and retention                | Reads should try several stores in order and writes should reach all of them                 |

Import the shared `CacheAdapter` type and JSON helpers from `@whiteeclipse/cache`. Import constructors and their adapter
types from the dedicated subpaths:

| Import                           | Environments                                            |
|----------------------------------|---------------------------------------------------------|
| `@whiteeclipse/cache/memory`     | Browsers and servers                                    |
| `@whiteeclipse/cache/indexeddb`  | Environments providing IndexedDB                        |
| `@whiteeclipse/cache/aggregate`  | Browsers and servers, subject to child requirements     |
| `@whiteeclipse/cache/filesystem` | Node-compatible servers; blocked for browser resolution |

The root and portable subpaths do not import filesystem code. The filesystem subpath resolves only with the `node`
runtime condition and explicitly blocks the `browser` condition. Keep `node` disabled in browser build configurations:
the current Vite resolver can bypass a null browser export when both conditions are enabled. TypeScript consumers using
bundler resolution can use its types, but their server bundler must enable `node` to load its implementation.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                               |
|----------|------------|---------------|-----------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Introduce cache concepts, guarantees, and adapter imports |
