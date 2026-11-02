---
id: cache-lru-memory
---

# LRU memory adapter

The memory adapter retains independent memory-backed Blobs within a byte budget. See
the [package documentation](./README.md) and [shared contract](./contract.md).

## Usage

```ts
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";

await using cache = createLruMemoryCacheAdapter(16 * 1024 * 1024);
await cache.write("greeting", new Blob(["Hello"], { type: "text/plain" }));
const blob = await cache.read("greeting");
if (blob !== undefined) {
    console.log(await blob.text());
}
```

`createLruMemoryCacheAdapter(maxBytes)` returns synchronously. Its readonly `maxBytes` property exposes the configured
budget. The runtime needs standard Blob APIs and asynchronous disposal support.

## Retention and accounting

The budget must be a nonnegative safe integer; invalid values throw `RangeError`. Zero disables retention. Each entry
costs `Math.max(blob.size, 1)`, so empty Blobs cannot accumulate without consuming capacity.

Successful reads and retained writes make their entry the most recently used. When a retained write exceeds the total
budget, the least recently read or written entries are evicted until the cache fits. Misses and removals do not refresh
recency. Replacement and removal release the previous entry's accounted capacity.

A single Blob larger than the budget is not copied or retained. Its write resolves, removes an older value under the
same key, and leaves unrelated entries untouched. A caller can therefore observe a miss immediately after a successful
write.

## Copying and lifetime

Accepted writes read the entire input with `arrayBuffer()` and create an independent Blob preserving its MIME type. An
input read failure leaves existing entries unchanged. This variant suits small reusable payloads; copying large inputs
temporarily increases memory use.

The budget measures retained content, excluding keys, object overhead, temporary copies, and caller-held references. It
is not a process memory limit. Eviction and disposal drop cache references without forcing garbage collection or
invalidating caller-held memory-backed Blobs. Disposal clears all entries. There is no spillover store.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                        |
|----------|------------|---------------|----------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Document memory retention and its dedicated import |
