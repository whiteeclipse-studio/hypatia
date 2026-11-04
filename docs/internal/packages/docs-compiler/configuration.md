---
id: docs-compiler-configuration
parent: ./README.md
---

# Configuration

`compile(configuration)` accepts repository inputs and ordered plugins. See the [[./README.md|package documentation]]
for coverage and the [[./compiler.md|compiler reference]] for execution and watching.

## Inputs and modes

```ts
type Input = string | URL;

interface Options {
    readonly repositories: Input | readonly Input[];
    readonly plugins?: readonly CompilerPlugin[];
    readonly cache?: CompilerCacheConfiguration;
}
```

Omit `watch` or set `watch: false` for `Promise<Snapshot>`. Set `watch: true` for `Promise<WatchResult>`. There is no
persistent compiler instance or separate `input` field. `repositories` does not accept a preconstructed Repository or
reference object.

Plugins interpret source locations. The [[./plugins/filesystem-loader.md|filesystem loader]] handles local directories;
the [[./plugins/archive-reader.md|archive reader]] handles archive paths and HTTP (S) URLs. A configured input that no
plugin resolves or loads rejects compilation. Multiple source locations are supported, but final repository IDs must be
unique when the snapshot is assembled.

The plugin list defaults to empty and is fixed before configuration hooks run. No built-in plugin is enabled
automatically. Names are diagnostic labels; duplicate names and repeated plugin entries are not deduplicated.

## Command-line wrapper

The `docs-compiler` executable configures `markdownParser`, `filesystemLoader`, `linkResolver`, and `archiveWriter` for
one compilation. Repository inputs are positional, defaulting to `.`. Its translations, wikilinks, and callouts options
default to enabled, independently of programmatic defaults. Positive and `--no-` boolean switches are supported; the
last occurrence wins. Heading aliases and cache configuration remain programmatic options.

The [package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/platform/docs-compiler/README.md#command-line-builds)
provides the argument reference, examples, path semantics, and exit statuses. The CLI is exploratory under draft
RFC-0005 and requires a new alpha release before its registry invocation is available.

## Configuration merging

`mergeCompilationConfiguration(base, overrides)` replaces `repositories`, appends supplied `plugins`, merges defined
individual cache fields, and applies a supplied `watch` value. The result is deeply frozen, including nested arrays and
shared plugin objects; shared objects supplied by the caller can therefore become frozen.

During compilation, `config` hooks may return repository and cache updates. They cannot change the selected plugin
sequence or watch mode. Each hook observes preceding updates. `configResolved` receives the final options after cache
creation.

## Compiler-owned cache

```ts
interface CompilerCacheConfiguration {
    readonly memoryMaxBytes?: number;
    readonly directory?: string;
    readonly databaseName?: string;
}
```

| Option           | Default and effect                                                                                                                            |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `memoryMaxBytes` | 104,857,600 bytes (100 MiB) of LRU memory; zero disables memory retention.                                                                    |
| `directory`      | Server-only existing parent directory; defaults to the system temporary directory. A private temporary cache directory is created beneath it. |
| `databaseName`   | Browser-only IndexedDB database, default `@whiteeclipse/docs-compiler-cache`; deleted on disposal.                                            |

Memory is followed by filesystem storage on servers or IndexedDB in browsers. The compiler constructs and disposes the
aggregate cache. Plugins use the shared hook context adapter and do not dispose it. Immutable payload keys keep reads
tied to their represented source version.

Use a dedicated browser database name; it is temporary compiler storage, not a persistent offline library. Call
`compile()` only once per browser worker, including after failure or disposal; create a fresh worker for another
invocation.

## Runtime and limits

Source loading, Markdown parsing, and archive output require Bun. Archive input uses web streams and HTTP (S), with
conditional local-file support on servers. Browser compilation needs IndexedDB, `fetch`, `DecompressionStream`, and an
ES module bundler honoring the browser conditions. Disposal polyfills are imported by the compiler; consumers still need
syntax support or transpilation for `using` and `await using`.

There are no global `limits`, file-count, file-size, or timeout options in the compiler configuration. Archive-reader
bounds are [[./plugins/archive-reader.md#Resource bounds|plugin-specific]]. Other source processing uses cooperative
cancellation rather than an enforced execution deadline.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                   |
|----------|------------|---------------|---------------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Define multi-repository configuration and processing limits   |
| 2        | 2026-10-30 | Akane SHIMOKA | Align inputs, optional plugins, and limits with the prototype |
| 3        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                                 |
| 4        | 2026-11-04 | Akane SHIMOKA | Replace obsolete input and limits configuration               |
| 5        | 2026-11-04 | Akane SHIMOKA | Document the one-shot CLI configuration                       |
