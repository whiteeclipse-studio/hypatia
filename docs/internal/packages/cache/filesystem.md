---
id: cache-filesystem
parent: ./README.md
next: ./indexeddb.md
previous: ./memory.md
---

# Filesystem adapter

The filesystem adapter stores Blobs in an owned temporary directory and returns file-backed Blobs for lazy reads. See
the [package documentation](./README.md) and [shared contract](./contract.md).

## Usage

```ts
import { createFileSystemCacheAdapter } from "@whiteeclipse/cache/filesystem";

await using cache = await createFileSystemCacheAdapter();
await cache.write("greeting", new Blob(["Hello"], { type: "text/plain" }));
const blob = await cache.read("greeting");
if (blob !== undefined) console.log(await blob.text());
```

`createFileSystemCacheAdapter(location?)` creates a fresh directory beneath an existing parent, defaulting to the system
temporary directory. The readonly `directory` property exposes its absolute path. Directory creation failures reject.

The runtime must implement `node:fs.openAsBlob`, `node:fs/promises.mkdtempDisposable`, and asynchronous disposal. This
variant requires filesystem access. Its package export is blocked under the `browser` condition and requires the `node`
condition at runtime.

## Storage and writes

An in-memory map associates opaque keys with UUID filenames and MIME types. Keys are never interpreted as paths. Writes
stream input into a new file rather than first materializing the complete payload in a JavaScript buffer. After copying
succeeds, the adapter removes the previous file and publishes the new map entry.

A failed write removes its partial file and preserves the prior entry. If partial-file cleanup also fails, the operation
rejects with an `AggregateError` containing the write and cleanup failures. All calls through the adapter are queued, so
subsequent reads cannot observe a partial replacement.

Reads use `openAsBlob` without eagerly loading all bytes. A missing mapped file produces a miss; other access errors
reject. A Blob can still fail later while being consumed if its backing file changes or disappears.

## Retention and cleanup

There is no byte budget or automatic eviction policy. Storage grows until entries are replaced, removed, or the adapter
is disposed. This is temporary storage: a new adapter does not reopen earlier entries, and the key map is not persisted.

Replacement and removal delete backing files, potentially invalidating borrowed Blobs. Disposal drains admitted
operations and removes the complete owned directory. Finish consuming file-backed Blobs first. The adapter does not
retain old files on behalf of readers.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                           |
|----------|------------|---------------|-------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Document temporary storage and its server-only import |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                         |
