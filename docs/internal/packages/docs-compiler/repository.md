---
id: docs-compiler-repository
parent: ./README.md
---

# Repository and Snapshot

A Repository is a fixed collection of [[./artifacts.md|Artifacts]]. A Snapshot owns the repositories and resources
produced by compilation. See the [[./README.md|package documentation]] for coverage.

## Interfaces

```ts
interface Repository extends Iterable<readonly [string, AnyArtifact]> {
    readonly id: string;
    readonly name: string;
    readonly metadata: unknown;
    getArtifact(path: string): AnyArtifact | undefined;
}

interface Snapshot extends ReadonlyMap<string, Repository>, AsyncDisposable {}
```

Repository iteration yields logical-path/artifact pairs; order is unspecified. Each key equals its artifact's `path`,
and paths are unique within that repository. `getArtifact(path)` returns `undefined` for an absent path without trying
to load content. A content-read failure does not remove the artifact from its inventory.

Repository identity is separate from its source reference. The filesystem loader derives its final ID and name from the
directory basename; the archive reader preserves manifest identity. The snapshot map uses these final IDs and rejects
duplicates.

Repositories are not individually disposable. Dispose the Snapshot for a one-shot compilation or the watch session for
watching.

## Fixed data and independent reads

Final repository and artifact handles are frozen. Metadata is independently copied and deeply frozen, including nested
values. Inventory and represented content versions remain fixed for that snapshot.

`artifact.read()` returns a new HAST object for documents and translations, a separately owned Blob for assets, or
`undefined` for unknown records. Changing a returned tree does not affect subsequent reads. Returned metadata and
content remain usable after snapshot invalidation.

Payloads are stored under fresh immutable compiler-cache keys. A missing payload causes its read to fail rather than
refetching a newer source version. Source files are checked for changes around loading; this does not provide an atomic
filesystem snapshot across all files.

## Lifetime

One-shot snapshots own the cache and compilation resources. Disposal invalidates handles immediately, waits for admitted
reads to settle, and then releases storage and registered resources. Repeated disposal shares the same result; cleanup
failures are aggregated.

After invalidation, snapshot map access, repository and artifact property access, lookups, and iterator steps throw
`ReferenceError`; new reads reject with `ReferenceError`. Already admitted reads may complete, and their returned values
remain independent of the disposed storage.

During [[./compiler.md#Watching|watching]], the session owns the cache and publishes replacement snapshots. Successful
replacement invalidates the old snapshot; failed rebuilds preserve it. Unchanged payloads remain reusable, while
old-generation-only entries are released after old reads drain. Do not retain a handle expecting it to survive a
replacement; retain independently returned content if needed.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                      |
|----------|------------|---------------|------------------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Define Repository interface and snapshot lifecycle               |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                                    |
| 3        | 2026-11-04 | Akane SHIMOKA | Replace repository-owned disposal with current Snapshot lifetime |
