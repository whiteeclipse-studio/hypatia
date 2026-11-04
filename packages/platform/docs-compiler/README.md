---
id: documentation-builder-readme
standard_revision: 1
---

# @whiteeclipse/docs-compiler

`@whiteeclipse/docs-compiler` turns a repository’s documentation into structured content that applications can read,
render, and share. It brings Markdown pages, translations, and supporting assets together while preserving the
relationships between them.

Choose the plugins your sources need: discover files, parse Markdown, resolve links, and save the result as an archive.
An application can then open that archive to access the compiled documentation, including its metadata and assets.

The result is a Repository snapshot: a fixed collection of artifacts whose contents you can read when needed. This gives
documentation websites and other tools a common starting point for presenting the material.

This README describes the exploratory `0.1.0-alpha.2` implementation
under [Hypatia draft RFC-0005](https://whiteeclipse.dev/hypatia/docs/internal/rfcs/0005-documentation-publication).
Acceptance and production publication approval remain pending.
The [complete package reference](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/README.md)
documents the current APIs and format.

## Setup

Use the repository workspace and install dependencies at its root:

```sh
bun install
cd packages/platform/docs-compiler
```

Examples below run from this package directory. Source compilation, Markdown parsing, and archive writing require Bun
`>=1.4.0` and the corresponding native APIs. The examples use package-local source imports; applications can import the
compiler from `@whiteeclipse/docs-compiler`. Built-in plugins have explicit
`@whiteeclipse/docs-compiler/packages/<name>` exports. There is no current CLI or Vite integration.

## Your first compilation

Start with a local repository containing Markdown documentation. The filesystem loader finds the source files, the
Markdown parser turns them into structured documents, and the link resolver connects those documents to their
references.

From the package directory:

```ts
import { compile } from "./src";
import { filesystemLoader } from "./src/plugins/filesystem-loader";
import { markdownParser } from "./src/plugins/markdown-parser";
import { linkResolver } from "./src/plugins/link-resolver";

await using snapshot = await compile({
    repositories: "../../..",
    plugins: [filesystemLoader(), markdownParser(), linkResolver()],
});
```

`snapshot` holds the compiled repositories. You can browse their documents and metadata, then read individual articles
or assets when you need their contents. Keeping the snapshot in an `await using` scope releases its resources when you
finish.

## Reading documentation in the browser

You can also open a compiled archive in the browser. This lets your application read documentation without downloading
the original repository or running the Markdown parser again.

Here’s an example for a browser worker, bundled from the package directory:

```ts
import { compile } from "./src";
import { archiveReader } from "./src/plugins/archive-reader";

await using snapshot = await compile({
    repositories: "https://example.com/documentation.tgz",
    plugins: [archiveReader()],
});

const repositories = [...snapshot.values()].map(repository => ({
    id: repository.id,
    name: repository.name,
}));

postMessage(repositories);
```

Replace the example URL with your hosted archive. Once loaded, its repositories expose the same documents, metadata, and
assets as a compilation from local sources.

Bundle the worker with browser conditions enabled, and use a fresh worker for each compilation. The browser needs
IndexedDB and gzip decompression through `DecompressionStream`; the archive server must also allow your application to
fetch it through CORS. Your build tooling should support or transpile `await using`.

## Working with compiled documentation

Whether you compile local files or open an archive, you work with the same Repository interface. Each repository
contains artifacts: documents, translations, assets, and entries whose contents haven’t been interpreted.

You can browse their metadata without reading their contents. When you need an article or an asset, call its `read()`
method:

```ts
const repository = snapshot.get("hypatia");
const artifact = repository?.getArtifact("docs/readme.md");

if (artifact?.type === "document") {
    console.log(artifact.metadata.title);

    const article = await artifact.read();
    // Use the article's HAST tree in your rendering pipeline.
}
```

Documents and translations provide HAST trees; assets provide Blobs. Your application decides how to present them.

Keep the snapshot alive while using its repositories and artifacts. The `await using` declaration in the examples
releases their backing resources when the surrounding scope ends.

## Plugin reference

| Export suffix                 | Function                     | Purpose                                                                    |
|-------------------------------|------------------------------|----------------------------------------------------------------------------|
| `/packages/filesystem-loader` | `filesystemLoader(options?)` | Local discovery, raw assets, translations, and native watch subscriptions. |
| `/packages/markdown-parser`   | `markdownParser(options?)`   | Bun Markdown/front matter parsing and structured metadata.                 |
| `/packages/link-resolver`     | `linkResolver()`             | HAST link rewriting and queued dependency inclusion.                       |
| `/packages/archive-writer`    | `archiveWriter(options?)`    | Bun gzip TAR output.                                                       |
| `/packages/archive-reader`    | `archiveReader(options?)`    | Bounded archive validation and Repository restoration.                     |

Prefix these suffixes with `@whiteeclipse/docs-compiler`. The first, second, and fourth exports are Bun-only. No plugin
is enabled by default. See
the [plugin reference](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/plugins/README.md) for
options, ordering, custom hooks, and resource ownership.

Markdown supports GFM and disables raw source HTML. `wikilinks` and `callouts` default to false. Install
`remark-wiki-link@2.0.1` or `@r4ai/remark-callout@0.6.2` before enabling the respective option. Metadata extraction
separates article HAST from copyright/licence and revision sections. Parsing does not establish complete
documentation-standard compliance.

## Ownership, watching, and cache

A one-shot Snapshot is a readonly map keyed by repository ID and owns its cleanup. Repositories and Artifacts are
lifetime-bound handles. Dispose with `await using` or `[Symbol.asyncDispose]()`. Access after invalidation fails;
returned metadata and content remain independently usable.

Set `watch: true` to receive a disposable `WatchResult` async iterable instead. Successful replacement invalidates the
preceding snapshot; failed rebuilds preserve it and report through `session.errors`. Breaking snapshot iteration shuts
down the session. Watch mode skips archive output. The filesystem loader supplies invalidation subscriptions;
archive-reader can use a caller-supplied subscription to receive archive replacements.

The compiler owns a shared cache: 100 MiB LRU memory followed by temporary server filesystem storage or browser
IndexedDB. `cache.memoryMaxBytes: 0` disables memory retention. The browser database defaults to
`@whiteeclipse/docs-compiler-cache` and is deleted on disposal. This is temporary backing storage, not a persistent
offline documentation library.

See [configuration](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/configuration.md), [compilation and watching](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/compiler.md),
and [snapshot lifetime](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/repository.md) for full
behavior.

## Verification and boundaries

From this package directory:

```sh
bun run typecheck
bun run lint
```

`bun --conditions=development test/compile.ts` reads an existing `dist/docs/hypatia.tgz` and logs translations. It is a
development fixture, not a command that builds an archive. The `test` script runs Vitest over `src`; no docs-compiler
source test files are currently supplied.

Archive schema version 1 is independent of the package version. See
the [serialization reference](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/serialization.md)
for exact layout and validation boundaries. The writer collects repository entries before compression; the reader uses
bounded in-memory archive parsing.

The compiler imports scoped explicit-resource-management polyfills. Its package marks `src/polyfills.ts` as
side-effectful so bundlers retain those runtime definitions in browser workers. Browser builds still need to transpile
`using` and `await using` for targets without syntax support.

Archive readers can supply `openSource(source, signal)` and `subscribe(source, changed, signal)` callbacks to reuse
downloaded bytes and invalidate a stable input in watch mode. This lets a browser worker retain a single compiler
session across updates. See
the [archive-reader reference](https://whiteeclipse.dev/hypatia/docs/internal/packages/docs-compiler/plugins/archive-reader)
for callback and lifetime details.

Rendering, navigation, search, website routing, locale selection, publication policy, and persistent offline storage
belong to consumers. HAST and binary content still need rendering and publication security checks; archive validation
does not establish authenticity or safe rendering. No release or deployment is performed by these examples.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                            |
|----------|------------|---------------|------------------------------------------------------------------------|
| 1        | 2026-11-04 | Akane SHIMOKA | Introduce the compiler, plugins, browser examples, and watch transport |
