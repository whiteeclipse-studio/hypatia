---
id: cache-aggregate
parent: ./README.md
previous: ./indexeddb.md
---

# Aggregate adapter

The aggregate adapter composes child caches with ordered fallback reads and replicated writes and removals. See
the [package documentation](./README.md) and [shared contract](./contract.md).

## Usage

```ts
import { createAggregateCacheAdapter } from "@whiteeclipse/cache/aggregate";
import { createFileSystemCacheAdapter } from "@whiteeclipse/cache/filesystem";
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";

await using cache = createAggregateCacheAdapter([
    createLruMemoryCacheAdapter(1024 * 1024),
    await createFileSystemCacheAdapter(),
]);
await cache.write("greeting", new Blob(["Hello"], { type: "text/plain" }));
const blob = await cache.read("greeting");
if (blob !== undefined) console.log(await blob.text());
```

`createAggregateCacheAdapter(adapters)` returns synchronously and exposes the supplied list through its readonly
`adapters` property. Keep list membership fixed. The aggregate owns its children: access them through the aggregate, and
let it dispose them. Runtime requirements are those of the selected children and asynchronous disposal.

## Reads

Reads visit children in the supplied order and stop at the first Blob. Only `undefined` triggers fallback. A child error
rejects immediately, even if later children hold the key. A hit in a later child does not populate earlier caches.

For the example, a memory miss can fall back to the temporary filesystem. A subsequent read still checks memory first;
the aggregate does not promote the file-backed hit into memory.

## Replication and partial failure

Writes and removals invoke every distinct child concurrently and wait for every result. Failures reject with an
`AggregateError` containing the original rejection reasons in adapter order, including synchronous throws and non-Error
values.

There is no transaction across children and no rollback. If a write updates memory but fails on disk, the aggregate
rejects while memory can hold the new value and disk the old one. If the new memory entry is later evicted, a read can
return the older disk value. Consumers needing version consistency should use version-specific keys and manage
publication separately.

A successful write means each child operation resolved, subject to each child's retention policy. For example, the
memory child can skip an oversized entry while the filesystem child retains it.

## Ordering and disposal

Aggregate calls run sequentially; child replication is concurrent within a call. Disposal stops admission, drains
admitted calls, then attempts every distinct child's disposal concurrently. Cleanup errors are collected into an
`AggregateError`. Repeated disposal shares the same result and does not repeat child cleanup.

Duplicate child references are invoked once for replication and cleanup, while reads follow the supplied list. An empty
aggregate always misses and its writes, removals, and cleanup perform no child work. After disposal, new operations
still reject under the shared lifecycle contract.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                            |
|----------|------------|---------------|--------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Document aggregation, ownership, and dedicated imports |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                          |
