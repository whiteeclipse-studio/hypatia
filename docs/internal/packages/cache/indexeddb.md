---
id: cache-indexeddb
---

# IndexedDB adapter

The IndexedDB adapter stores Blobs in a named browser database using `idb`. See the [package documentation](./README.md)
and [shared contract](./contract.md).

## Usage

```ts
import { createIndexedDbCacheAdapter } from "@whiteeclipse/cache/indexeddb";

await using cache = await createIndexedDbCacheAdapter("example-cache");
await cache.write("greeting", new Blob(["Hello"], { type: "text/plain" }));
const blob = await cache.read("greeting");
if (blob !== undefined) console.log(await blob.text());
```

`createIndexedDbCacheAdapter(name)` opens a database asynchronously. Its readonly `name` property exposes that name. It
requires IndexedDB, standard Blob APIs, and asynchronous disposal support. Unavailable IndexedDB rejects rather than
falling back to memory.

## Database and transactions

Reserve the database name for this adapter. It opens schema version 1 with an `entries` object store and string keys.
The implementation checks that the store exists; it does not migrate an arbitrary existing database. Opening failures,
incompatible database operations, and unexpected non-Blob stored values reject.

Writes store Blobs directly and resolve after transaction commit. An aborted transaction preserves the previous entry.
Missing keys return `undefined`; quota, storage, and transaction errors reject. Browser-managed Blob backing storage
determines memory use.

Calls on one adapter are queued. Separate connections using the same name share committed data without sharing an
operation queue. Different names use separate databases. A version-change request from another client closes the
connection to allow an upgrade or deletion; subsequent operations reject. Recreate the adapter after resolving the
database change.

## Retention and verification limits

Disposal closes the connection after admitted operations finish; it does not delete entries. Opening the same name again
reuses stored data. `remove` deletes an individual entry. There is no adapter byte budget or TTL.

Data remains subject to browser quota, browser eviction, and user clearing. The adapter does not request
persistent-storage permission or guarantee survival across sessions. Consumers still need a way to recover misses.

Current tests use the development-only `fake-indexeddb` implementation. Real-browser and Safari verification remain
outstanding.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                           |
|----------|------------|---------------|-------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Document browser persistence and its dedicated import |
