---
id: docs-compiler-local-repository-resolver
parent: ./README.md
---

# Filesystem loader

`filesystemLoader(options?)` loads a local directory into raw cache-backed assets and can watch it for changes. See
the [[../README.md|package documentation]] for coverage and [[./README.md|plugin contracts]].

## Usage

```ts
import { filesystemLoader } from "@whiteeclipse/docs-compiler/packages/filesystem-loader";

const loader = filesystemLoader({
    cwd: process.cwd(),
    include: ["docs/**", "LICENCE"],
    exclude: ["docs/private/**"],
    translations: false,
});
```

The plugin requires Bun for MIME and image metadata APIs. It handles local paths and `file:` URLs, delegating other
protocols and non-directory root inputs. Relative roots resolve against `cwd`, captured when the plugin is constructed.
Missing or unreadable local roots reject resolution. Child references resolve relative to the importer, or to the root
for repository importers.

Final Repository ID is the normalized lowercase directory basename; name uppercases the basename’s first character and
metadata is an empty object. Two inputs with the same derived ID cannot coexist in one final snapshot. Source IDs use
absolute physical locations independently of these display properties.

## Selection

| Option         | Default                                                           |
|----------------|-------------------------------------------------------------------|
| `cwd`          | Current working directory at plugin construction.                 |
| `include`      | `docs/**/*.md`, `LICENCE`, `LICENSE`, `LICENCE.md`, `LICENSE.md`. |
| `exclude`      | Empty array.                                                      |
| `translations` | `false`.                                                          |

Supplied include and exclude arrays replace their respective defaults and are copied and frozen. Globs are
repository-relative, case-sensitive, forward-slash patterns. Empty patterns, absolute paths, backslashes, and parent
traversal are rejected.

Default discovery includes translation Markdown when translations are disabled. With `translations: true`, automatic
discovery skips `docs/translations/**`, then includes related candidates
through [[./filesystem-translations.md|translation discovery]]. Explicit exclusions always apply. Root READMEs and
assets need custom patterns or link inclusion; missing matches yield an empty inventory rather than an error.

Physical paths must stay within the root and match their canonical realpaths; symlinked files or parent paths are
skipped during discovery and rejected for eligible child resolution. Distinct files that normalize to the
same [[../artifacts.md#Logical paths|logical path]] reject compilation. A non-excluded linked source can be included
even when it does not match discovery globs. No extension or directory-index inference is performed.

## Loading and metadata

Each selected file becomes an `asset`, preserving repository-relative directory and extension. Markdown and
extensionless root licence aliases use `text/markdown`; parsing is delegated to [[./markdown-parser.md|markdownParser]].
Other MIME types come from `Bun.file(path).type`, including parameters or an octet-stream fallback. This is MIME
inference, not binary validation.

The loader reads bytes once, checks filesystem identity, size, and nanosecond modification/change timestamps against the
resolved version, and stores a Blob in the compiler-owned cache. A changed version rejects loading. This check is per
file and does not make the complete repository an atomic disk snapshot.

Supported image bytes can supply `width` and `height` through `Bun.Image.metadata()`; availability depends on Bun and
platform support, and EXIF orientation is not applied. Uncompressed PCM or IEEE-float WAV headers can supply `duration`
in seconds. Unsupported image formats, other audio/video metadata, and PDF page counts leave optional metadata absent.
No subprocesses or additional format readers run.

## Watching

With `watch: true`, the plugin registers a native recursive directory subscription before discovery. Events invalidate
affected known sources and inventories; additions, removals, directory renames, and translation catalog changes are
rediscovered. Coarse events compare known stat versions. Explicit exclusions and irrelevant changes are filtered.

Compiler dependency tracking reuses unchanged records and schedules coalesced rebuilds. Watcher failures reach the
session error stream; shutdown closes subscriptions. Native recursive-watch support and event granularity depend on the
runtime and filesystem.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                             |
|----------|------------|---------------|-------------------------------------------------------------------------|
| 1        | 2026-10-30 | Akane SHIMOKA | Document root discovery, absolute source IDs, and fixed-version loading |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                                           |
| 3        | 2026-11-04 | Akane SHIMOKA | Replace legacy resolver with current filesystem loader                  |
