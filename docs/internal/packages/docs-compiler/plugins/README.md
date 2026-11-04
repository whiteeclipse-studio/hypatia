---
id: docs-compiler-plugins
parent: ../README.md
---

# Plugins

Plugins resolve sources, load representations, transform data, and optionally write outputs. See
the [[../README.md|package documentation]] for coverage and [[../compiler.md|Compiler]] for lifecycle order.

## Built-in plugins

| Plugin                                         | Role                                                         | Runtime                                           |
|------------------------------------------------|--------------------------------------------------------------|---------------------------------------------------|
| [`filesystemLoader()`](./filesystem-loader.md) | Local repository discovery, raw assets, and native watching. | Bun                                               |
| [`markdownParser()`](./markdown-parser.md)     | Markdown-to-HAST parsing and metadata extraction.            | Bun                                               |
| [`linkResolver()`](./link-resolver.md)         | Rewrite HAST destinations and include linked artifacts.      | Server or browser with a suitable source resolver |
| [`archiveWriter()`](./archive-writer.md)       | Write one gzip TAR per completed repository.                 | Bun                                               |
| [`archiveReader()`](./archive-reader.md)       | Validate and restore serialized repositories.                | HTTP(S) through web APIs; local files on servers  |

[[./filesystem-translations.md|Translation discovery]] is an option of the filesystem loader, not a sixth plugin.
Plugins are exported under `@whiteeclipse/docs-compiler/packages/<plugin-name>`; the `/packages/` segment is part of the
current export path.

## Plugin interface

```ts
interface CompilerPlugin {
    readonly name: string;
    readonly config?: ConfigHook;
    readonly configResolved?: ConfigResolvedHook;
    readonly buildStart?: BuildStartHook;
    readonly resolveId?: ResolveIdHook;
    readonly load?: LoadHook;
    readonly transform?: TransformHook;
    readonly buildEnd?: BuildEndHook;
    readonly closeBundle?: CloseBundleHook;
}
```

Every hook is optional and may return synchronously or asynchronously. Plugin entries execute in array order; names
identify diagnostics and do not deduplicate entries. Plugins are trusted executable application code. Treat
configuration and incoming values as readonly.

| Hook                            | Arguments and result                                                                                |
|---------------------------------|-----------------------------------------------------------------------------------------------------|
| `config(configuration)`         | Partial repository/cache option updates, or `undefined`. Plugin sequence and watch mode stay fixed. |
| `configResolved(configuration)` | Final resolved options; returns no replacement.                                                     |
| `buildStart(configuration)`     | Per-build initialization; returns no replacement.                                                   |
| `resolveId(input, importer?)`   | A source reference, or `undefined` to delegate. Root inputs have no importer.                       |
| `load(reference)`               | Initial Artifact or Repository, or `undefined` to delegate.                                         |
| `transform(value, reference)`   | Replacement Artifact or Repository, or `undefined` to keep the current value.                       |
| `buildEnd(repositories)`        | Completed inventories for validation or final processing.                                           |
| `closeBundle(repositories)`     | One-shot finalization, such as archive output; skipped in watch mode.                               |

A missing root resolver or loader rejects compilation. Replacements preserve source kind and artifact logical path.
There is no `configure`, `resolve`, `addWatchSource`, or `null` exclusion convention in this API.

## Source references

```ts
interface RepositoryReference {
    readonly type: "repository";
    readonly id: string;
    readonly version?: string;
}
interface ArtifactReference {
    readonly type: "artifact";
    readonly id: { readonly repositoryId: string; readonly path: string };
    readonly version?: string;
}
```

Reference IDs are opaque plugin source identities, not necessarily final Repository IDs or physical paths. Artifact IDs
are scoped to the repository source. Different observed versions of the same source in one build are rejected. Resolvers
return `undefined` for source kinds they do not own.

## Hook services

All contexts expose `logger`, `signal`, and `onDispose(cleanup)`. After configuration, contexts also expose the
compiler-owned `cache` and `watch(reference, subscribe)`. Contexts and derived services are frozen; mutable plugin
bookkeeping stays outside them. Use method syntax for hooks that need `this`.

Load and transform hooks additionally receive:

| Service              | Effect                                                                                                             |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| `resolve(input)`     | Resolve relative to the requesting source without loading it. Returns a reference or `undefined`.                  |
| `load(input)`        | Resolve, load, and fully transform a child source; rejects unresolved requests and awaited cycles.                 |
| `include(reference)` | Queue an artifact in the current repository without awaiting its transform. Rejects foreign repository references. |

Resolution alone does not include an artifact. Inclusion drains after the repository transform and admits further
inclusions until completion. Use it for mutual links instead of awaiting a recursive `load()` chain.

## Payloads and cleanup

Write immutable content through `this.cache` under fresh keys, and supply
an [[../artifacts.md#Shared contract|ArtifactPayload]] for watch reuse. Its decoder is independent of build signals,
temporary resources, and prior handles. Consume borrowed cache Blobs before returning independently owned content. Cache
misses fail the read; do not substitute newer source bytes under an old payload key.

Use `onDispose()` for resources held until their compilation or build scope ends. The compiler owns the cache; a plugin
does not dispose it. Check `signal` around work and pass it to supported asynchronous I/O. CPU-bound plugin work is not
forcibly interrupted.

## Watch subscriptions

`watch(reference, subscribe)` registers a subscription keyed by source identity. In load/transform contexts it also
records a dependency. Repeated registration reuses the first subscription. One-shot compilation does not start
subscriptions.

The subscription callback receives `signal`, `invalidate(referenceOrReferences)`, and `reportError(error)`, and returns
cleanup. Await registration so setup failures reach the compiler. Use `configResolved` for subscriptions that must exist
before the initial build. A subscription reports invalidation; the compiler schedules rebuilding and owns cleanup.

## Example transform

```ts
import type { CompilerPlugin } from "./src";

const reportInventory: CompilerPlugin = {
    name: "report-inventory",
    buildEnd(repositories) {
        for (const repository of repositories) {
            this.logger.info("Compiled {name}", { name: repository.name });
        }
    },
};
```

This package-local example inspects completed metadata without reading contents or changing the inventory.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                  |
|----------|------------|---------------|------------------------------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Define plugin contracts, resolved paths, and resource lifecycle              |
| 2        | 2026-10-30 | Akane SHIMOKA | Clarify contexts and on-demand loading; reference local and Markdown plugins |
| 3        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                                                |
| 4        | 2026-11-03 | Akane SHIMOKA | Reference current source and processing plugins and distinguish earlier APIs |
| 5        | 2026-11-04 | Akane SHIMOKA | Rebuild current hook contracts and plugin index                              |
