---
id: cache-readme
standard_revision: 1
---

# @whiteeclipse/cache

Blob-based caches with memory, temporary filesystem, IndexedDB, and aggregate adapters. Consumers store reusable copies
under opaque string keys and recover data when entries are missing.

This `0.1.0-alpha.1` alpha package remains exploratory pre-production work associated
with [Hypatia RFC-0005 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md#revisions);
acceptance remains pending.

See
the [package documentation](https://github.com/whiteeclipse-studio/hypatia/blob/feature/website/docs/internal/packages/cache/README.md)
for cache concepts,
guarantees, and each adapter's behavior.
Its [canonical sources](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/cache/README.md)
are available alongside the package; website publication is separate.

## Setup and usage

Install the exploratory release with `bun add @whiteeclipse/cache@0.1.0-alpha.1`; the registry tag is `alpha`.
The workspace instructions below apply when developing this repository.

Add `"@whiteeclipse/cache": "workspace:*"` to a consuming workspace's dependencies and run `bun install` from the
repository root. The package ships built JavaScript and TypeScript declarations under `dist/`. Runtimes need standard
Blob APIs
and asynchronous disposal support; adapter-specific requirements are documented in the linked guide.

```ts
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";

await using cache = createLruMemoryCacheAdapter(1024 * 1024);
await cache.write("greeting", new Blob(["Hello"], { type: "text/plain" }));
const blob = await cache.read("greeting");
if (blob !== undefined) console.log(await blob.text());
```

`CacheAdapter` and the JSON helpers are exported from the package root. Constructors and adapter types use dedicated
`/memory`, `/indexeddb`, `/aggregate`, `/reference-counted`, and `/filesystem` subpaths. The root and portable subpaths
do not load filesystem code. The filesystem subpath requires the `node` runtime condition and explicitly blocks
`browser` resolution. Returned
Blobs are borrowed: finish using them before replacement, removal, eviction, or disposal. A successful write does not
guarantee retention. Dispose adapters when their lifetime ends.

## IndexedDB cleanup

IndexedDB entries survive disposal by default. For temporary storage, enable deletion on the adapter:

```ts
import { createIndexedDbCacheAdapter } from "@whiteeclipse/cache/indexeddb";

await using cache = await createIndexedDbCacheAdapter("temporary-cache", { deleteOnDispose: true });
```

With `deleteOnDispose: true`, disposal drains admitted operations, closes the connection, and deletes the entire
named database. Reserve that database exclusively for the adapter. Disposal rejects if deletion fails or is blocked
by another connection; repeated calls share the cleanup outcome. The option defaults to `false`.

## Shared payload ownership

The reference-counted wrapper is one shared adapter with explicit counts for individual keys:

```ts
import { createReferenceCountedCacheAdapter } from "@whiteeclipse/cache/reference-counted";
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";

await using cache = createReferenceCountedCacheAdapter(createLruMemoryCacheAdapter(1024 * 1024));
await cache.write("artifact-1", new Blob(["Unchanged"]));
await cache.write("artifact-2-v1", new Blob(["Before"]));
await cache.acquire("artifact-1"); // First snapshot.
await cache.acquire("artifact-2-v1");

await cache.acquire("artifact-1"); // Second snapshot reuses the payload.
await cache.write("artifact-2-v2", new Blob(["After"]));
await cache.acquire("artifact-2-v2");
await cache.release("artifact-1"); // First snapshot ends; one reference remains.
await cache.release("artifact-2-v1"); // Final reference: removes the old payload.

const blob = await cache.read("artifact-1");
if (blob !== undefined) console.log(await blob.text());
await cache.release("artifact-1"); // Second snapshot ends.
await cache.release("artifact-2-v2");
```

Wrapping transfers exclusive ownership of the backing adapter to the wrapper. Do not access or wrap the backing
adapter independently. The watch session owns the shared wrapper; snapshots acquire their keys and release them on
disposal, without disposing the adapter. Each owner tracks its acquisitions so every reference is released once.

`acquire(key)` increments the count without reading the payload. Acquiring an absent key is valid. Reads and writes
neither acquire nor release references. `release(key)` decrements the count and removes the backing entry on the final
release. Releasing an unacquired key rejects. A failed final removal preserves the reference so release can be retried.
Explicit `remove(key)` rejects while references remain, and otherwise delegates to the backing adapter.

Use immutable, versioned keys for represented payloads. Writes retain the backing adapter's replacement semantics;
the wrapper does not verify content identity. Reference counts prevent premature explicit removal, not eviction or
storage loss. Finish reads and consumption of borrowed Blobs before releasing their references. Ordinary JavaScript
objects and independent copies are outside this ownership mechanism.

All operations and reference updates are serialized. Adapter disposal immediately rejects new operations, drains
admitted operations, attempts removal of every still-referenced key, and disposes the backing adapter once. Cleanup
failures are collected in an `AggregateError`; repeated disposal shares the same result. Unreferenced entries, and
entries whose removal failed, survive disposal only when the backing adapter preserves them. No ownership is released
through garbage collection.

## Logging

Adapters obtain loggers through `@whiteeclipse/log` under the category `["whiteeclipse", "cache", adapter]`, where
`adapter` is `memory`, `filesystem`, `indexeddb`, or `aggregate`. They do not configure logging or
import the side-effectful default entrypoint. Configure logging in the consuming application; see
the [log package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/log/README.md) for
setup and environment defaults. The reference-counted wrapper uses the shared operation queue diagnostics.

| Level     | Events                                                                                                                   |
|-----------|--------------------------------------------------------------------------------------------------------------------------|
| `trace`   | Operation starts and completions, including read hits/misses and opaque keys                                             |
| `debug`   | Creation, disposal, LRU eviction, and writes skipped by the memory budget                                                |
| `warning` | Missing mapped files recovered as misses, IndexedDB version-change closure, and partial aggregate replication or cleanup |
| `error`   | Initialization, operation, and disposal failures, with the original error                                                |

Normal cache misses and eviction are expected and do not emit warnings. Blob payloads are not logged. Diagnostic records
preserve the existing operation results and failure contracts. Disposal diagnostics run once with the queue's cleanup,
including when disposal is called repeatedly. Aggregate children can emit their own diagnostics in addition to the
aggregate's result.

## JSON helpers

`encodeJson` and `decodeJson` convert between values and Blobs independently of cache storage:

```ts
import { decodeJson, encodeJson } from "@whiteeclipse/cache";

const blob = encodeJson({ title: "Getting started", revision: 1 });
const value: unknown = await decodeJson(blob);
```

`encodeJson` synchronously returns an `application/json` Blob using standard JSON serialization. Unsupported top-level
values and cyclic data throw. `decodeJson(blob)` returns `Promise<unknown>` and does not load Zod. Malformed JSON and
Blob read failures reject. Both helpers materialize the complete JSON representation.

For schema validation, add `"zod": "catalog:types"` to the consuming workspace. The root's named `types` catalog
supplies the Zod 4 range for this optional peer:

```ts
import { decodeJson, encodeJson } from "@whiteeclipse/cache";
import * as z from "zod";

const schema = z.object({ title: z.string(), revision: z.number().int().positive() });
const document = await decodeJson(encodeJson({ title: "Getting started", revision: 1 }), schema);
// Inferred as { title: string; revision: number }.
```

The schema overload infers the schema output and supports asynchronous refinements and transformations. Zod 4 and Zod
Mini schemas use `zod/v4/core`, loaded only when a schema is supplied. Schema failures reject.

## Development

Run checks from the repository root:

```sh
bun run --cwd packages/libraries/cache typecheck
bun run --cwd packages/libraries/cache test
bunx --bun --no-install eslint packages/libraries/cache/src
bunx --bun --no-install prettier --check packages/libraries/cache docs/internal/packages/cache
```

The docs-compiler resolution fixture runs with `bun packages/platform/docs-compiler/test/compile.ts` from the repository
root. Full compilation and website publication remain separate work. IndexedDB tests use `fake-indexeddb`; real-browser
and Safari verification remain outstanding.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                                   |
|----------|------------|---------------|-----------------------------------------------------------------------------------------------|
| 1        | 2026-10-28 | Codex         | Extract the flat cache contract and filesystem work in progress                               |
| 2        | 2026-10-28 | Codex         | Add JSON utilities with schema validation and a cataloged Zod peer                            |
| 3        | 2026-10-28 | Codex         | Decouple JSON stream conversion from cache operations                                         |
| 4        | 2026-10-28 | Codex         | Make schema validation and the Zod peer optional                                              |
| 5        | 2026-10-28 | Codex         | Implement filesystem streams, version retention, and draining disposal                        |
| 6        | 2026-10-28 | Codex         | Replace stream contracts and lifecycle tracking with borrowed Blobs and sequential operations |
| 7        | 2026-10-28 | Codex         | Define and test aggregate error handling and draining disposal                                |
| 8        | 2026-10-28 | Codex         | Share operation ordering and draining cleanup between adapters                                |
| 9        | 2026-10-28 | Codex         | Add a byte-bounded LRU memory adapter and eviction tests                                      |
| 10       | 2026-10-28 | Codex         | Add a persistent IndexedDB Blob cache and transaction tests                                   |
| 11       | 2026-10-28 | Codex         | Extract the shared operation queue into its own package                                       |
| 12       | 2026-10-29 | Akane SHIMOKA | Organize consumer documentation and isolate adapter imports by environment                    |
| 13       | 2026-10-30 | Codex         | Add scoped operation and lifecycle diagnostics through the log package                        |
| 14       | 2026-10-30 | Akane SHIMOKA | Replace the removed compiler inspection command with its resolution fixture                   |
| 15       | 2026-11-03 | Codex         | Add reference-counted ownership of cached payloads                                            |
| 16       | 2026-11-03 | Codex         | Configure IndexedDB database deletion on disposal                                             |
| 17       | 2026-11-04 | Akane SHIMOKA | Document alpha registry installation and release packaging                                    |
