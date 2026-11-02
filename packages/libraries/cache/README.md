---
id: cache-readme
standard_revision: 1
---

# @whiteeclipse/cache

Blob-based caches with memory, temporary filesystem, IndexedDB, and aggregate adapters. Consumers store reusable copies
under opaque string keys and recover data when entries are missing.

This private `0.1.0-alpha.1` workspace package remains exploratory pre-production work associated
with [Hypatia RFC-0005 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md#revisions);
acceptance remains pending.

See the [package documentation](https://whiteeclipse.dev/hypatia/internal/packages/cache) for cache concepts,
guarantees, and each adapter's behavior.
Its [canonical sources](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/cache/README.md)
are available alongside the package; website publication is separate.

## Setup and usage

Add `"@whiteeclipse/cache": "workspace:*"` to a consuming workspace's dependencies and run `bun install` from the
repository root. The package exposes TypeScript source and has no built distribution. Runtimes need standard Blob APIs
and asynchronous disposal support; adapter-specific requirements are documented in the linked guide.

```ts
import { createLruMemoryCacheAdapter } from "@whiteeclipse/cache/memory";

await using cache = createLruMemoryCacheAdapter(1024 * 1024);
await cache.write("greeting", new Blob(["Hello"], { type: "text/plain" }));
const blob = await cache.read("greeting");
if (blob !== undefined) console.log(await blob.text());
```

`CacheAdapter` and the JSON helpers are exported from the package root. Constructors and adapter types use dedicated
`/memory`, `/indexeddb`, `/aggregate`, and `/filesystem` subpaths. The root and portable subpaths do not load filesystem
code. The filesystem subpath requires the `node` runtime condition and explicitly blocks `browser` resolution. Returned
Blobs are borrowed: finish using them before replacement, removal, eviction, or disposal. A successful write does not
guarantee retention. Dispose adapters when their lifetime ends.

## Logging

Adapters obtain loggers through `@whiteeclipse/log` under the category `["whiteeclipse", "cache", adapter]`, where
`adapter` is `memory`, `filesystem`, `indexeddb`, or `aggregate`. They do not configure logging or import the
side-effectful default entrypoint. Configure logging in the consuming application; see
the [log package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/log/README.md) for
setup and environment defaults.

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
