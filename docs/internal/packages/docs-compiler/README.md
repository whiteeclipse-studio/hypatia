---
id: internal-documentation-compiler-pipeline
standard_revision: 1
parent: ../../../README.md
---

# @whiteeclipse/docs-compiler

`@whiteeclipse/docs-compiler` compiles documentation into immutable, disposable Repository snapshots. This documentation
covers the exploratory `0.1.0-alpha.3` workspace implementation.

The model
follows [Hypatia draft RFC-0005 revision 2](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md#revisions).
Acceptance remains pending. Archive serialization is an implementation facility outside the rebuilt RFC proposal's
scope. Neither implementation nor these references establish approval for production publication.

## Start here

The [package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/platform/docs-compiler/README.md)
provides setup and runnable package-local examples. This reference describes current behavior; it does not carry forward
the removed `documentation-builder` interface, Vite integration, HTML output, or earlier `createCompiler` API.
The current one-shot Bun CLI is described in the [[./configuration.md#Command-line wrapper|configuration reference]].

## Reference

| Topic                                      | Contents                                                                             |
|--------------------------------------------|--------------------------------------------------------------------------------------|
| [Compiler](./compiler.md)                  | One-shot compilation, watch sessions, hook order, errors, and verification commands. |
| [Configuration](./configuration.md)        | Inputs, configuration merging, runtime selection, and shared cache options.          |
| [Repository and Snapshot](./repository.md) | Inventory access, disposal, independent reads, and replacement lifetime.             |
| [Artifacts](./artifacts.md)                | Documents, translations, assets, unknown records, and logical paths.                 |
| [Plugins](./plugins/README.md)             | Plugin authoring contracts and the built-in plugin index.                            |
| [Serialization](./serialization.md)        | Version-1 manifest, record and payload layout, and validation boundaries.            |

## Consumer responsibilities

The compiler produces data for consuming applications. Routing, HTML rendering, navigation interfaces, search, locale
selection, persistent offline libraries, and publication policy are consumer concerns. Parsed or restored HAST is not a
rendering-safety guarantee; see the [[../../../standards/PUBLICATION.md|publication standard]].

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                        |
|----------|------------|---------------|----------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Introduce compiler specifications and plugin index |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                      |
| 3        | 2026-11-04 | Akane SHIMOKA | Rebuild current compiler documentation index       |
| 4        | 2026-11-04 | Akane SHIMOKA | Link the current one-shot Bun CLI reference        |
