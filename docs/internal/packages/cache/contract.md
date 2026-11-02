---
id: cache-contract
---

# Contract and guarantees

All four adapters implement `CacheAdapter`. See the [package documentation](./README.md) for the index and version
coverage.

## Keys and operations

Keys are opaque strings, not filesystem paths. Each key identifies one resource. The cache does not normalize keys,
generate versions, or determine freshness. Blob MIME types are preserved by the storage adapters.

| Operation                 | Result                                                       | Failure behavior                                                               |
|---------------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------|
| `read(key)`               | A borrowed `Blob`, or `undefined` for a miss                 | Access and storage errors reject; callers can distinguish an error from a miss |
| `write(key, contents)`    | `Promise<void>` after the operation completes                | Unreadable input and storage failures reject                                   |
| `remove(key)`             | `Promise<void>`; removing an absent key is a no-op           | Removal failures reject                                                        |
| `[Symbol.asyncDispose]()` | `Promise<void>` after admitted operations and cleanup settle | Cleanup failures reject                                                        |

A successful write does not guarantee future retention. The memory adapter can deliberately skip a write that exceeds
its budget; eviction and external storage loss can also cause misses. There is no shared TTL, automatic refresh,
cache-miss loader, or durability guarantee.

## Publication and failures

The [source interface](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/cache/src/types.ts)
specifies publication of completed entries: partial writes are invisible and a failed write preserves the previous
entry. The memory, filesystem, and IndexedDB implementations prepare or commit their replacement before readers through
the same adapter can observe it. Retention policy still applies; an oversized memory write resolves successfully and
removes any old value at that key.

The aggregate has a weaker guarantee across children: replication is not a transaction. A rejected write or removal can
leave successful children changed, with no rollback. Its [adapter page](./aggregate.md) explains how this affects reads.
Consumers requiring all-or-nothing updates across stores cannot rely on the aggregate for that property.

## Ordering and disposal

Each current adapter uses the shared `@whiteeclipse/async-queue` operation queue. Calls on one adapter run sequentially
in invocation order. A failed operation rejects its own promise and does not prevent later queued operations from
running. A slow write delays later reads. The aggregate runs its child writes or removals concurrently within one queued
operation.

These queues do not coordinate independent adapter instances, other IndexedDB connections, or external filesystem
changes.

Disposal immediately rejects new operations, drains already admitted operations, then releases owned resources. It does
not cancel admitted writes or wait for callers to finish using returned Blobs. Repeated disposal joins the same cleanup
result, including a cleanup failure. Retention after disposal depends on the variant.

Use `await using` where the runtime supports asynchronous resource management, or call
`await cache[Symbol.asyncDispose]()` in a `finally` block.

## Blob ownership

Keep an input Blob valid until its write settles. A completed accepted write in a storage adapter owns its stored copy,
so a file backing the input may then be removed.

Returned Blobs are borrowed. Under the common contract, replacement, removal, eviction, or disposal may invalidate them
and streams or object URLs derived from them. Finish reading them before those actions. Serialization of cache
operations does not extend the lifetime of a Blob after `read` resolves.

Memory-backed Blobs currently remain usable through caller-held references after eviction or disposal. That
implementation behavior does not provide a portable guarantee for other adapters. File-backed Blobs can become
unreadable when their files are removed.

Object URLs belong to the consumer. Revoke them when finished; adapters do not track or revoke them. If data must
outlive an entry, make an independent copy while its borrowed Blob is valid and account for the additional memory.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                         |
|----------|------------|---------------|-----------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Describe operations, lifetime, and guarantee limits |
