---
id: docs-compiler-pipeline
parent: ./README.md
---

# Compiler

`compile()` runs a plugin pipeline and returns an owned snapshot or watch session. See
the [[./README.md|package documentation]] for coverage and [[./configuration.md|configuration]] for its options.

## One-shot compilation

```ts
import { compile } from "./src";
import { filesystemLoader } from "./src/plugins/filesystem-loader";
import { markdownParser } from "./src/plugins/markdown-parser";
import { linkResolver } from "./src/plugins/link-resolver";

await using snapshot = await compile({
    repositories: "../../..",
    plugins: [markdownParser(), filesystemLoader({ translations: true }), linkResolver()],
});

for (const [id, repository] of snapshot) {
    for (const [path, artifact] of repository) {
        console.log(id, path, artifact.type);
    }
}
```

The snapshot is a readonly map keyed by final repository ID. Keep it alive while accessing repositories or artifacts.
Dispose it with `await using` or `[Symbol.asyncDispose]()`; the lifetime contract is documented
under [[./repository.md|Repository and Snapshot]].

## Watching

```ts
const session = await compile({
    repositories: "../../..",
    plugins: [markdownParser(), filesystemLoader({ translations: true }), linkResolver()],
    watch: true,
});
await using owner = session;

const errors = (async () => {
    for await (const error of session.errors) console.error(error);
})();
for await (const snapshot of session) {
    console.log([...snapshot.keys()]);
    // Consume this snapshot before the next successful replacement invalidates it.
}
await errors;
```

The first successful build is available through the async iterator. Notifications coalesce by source identity into at
most one pending rebuild; unchanged records and payloads can be reused. Each successful replacement invalidates the
previous snapshot. Failed rebuilds retain the current snapshot and publish an error instead.

Both snapshot and error streams retain the latest unread value rather than an unbounded history. Breaking or returning
from snapshot iteration shuts down the session. Explicit disposal also cancels work, invalidates handles, drains
admitted reads, closes subscriptions, and releases cache storage. Shutdown failures reject disposal with an
`AggregateError`.

The filesystem loader supplies native watch subscriptions. Archive-reader inputs do not subscribe or poll. Watch mode
skips `closeBundle`, so archive-writer does not write on rebuilds.

## Lifecycle

| Phase            | Behavior                                                       |
|------------------|----------------------------------------------------------------|
| `config`         | Runs once per invocation, merging permitted updates.           |
| `configResolved` | Receives final options and can register session subscriptions. |
| `buildStart`     | Runs before source resolution on every build.                  |
| `resolveId`      | Identifies each repository and child source.                   |
| `load`           | Supplies the initial Repository or Artifact.                   |
| `transform`      | Passes loaded values through every plugin in order.            |
| `buildEnd`       | Receives completed repositories.                               |
| `closeBundle`    | Final output processing. One-shot only.                        |

Child pipelines can run while a repository transform assembles its inventory. A transform returning `undefined`
preserves the previous value; a replacement must preserve source kind and resolved artifact path.

Resolution and loading track dependencies and versions. `include()` queues an artifact without awaiting its transform,
permitting self-links and mutual document links.

## Errors and cleanup

Initial configuration, resolution, loading, transform, output, or snapshot failures reject `compile()`. The invocation
cleans up resources acquired before failure. Plugin cancellation is cooperative through `this.signal`; asynchronous
source reads forward that signal where supported. Started artifact reads drain before their backing storage is released.

Watch build, subscription, and recoverable cleanup errors reach `session.errors`. Disposal attempts all owned cleanup
and reports shutdown failures. Successful checks do not imply RFC acceptance or publication approval.

## Verification

From the package directory, the available checks are:

```sh
bun run typecheck
bun run lint
```

`bun --conditions=development test/compile.ts` runs the current repository-local archive-reading fixture. It expects
`dist/docs/hypatia.tgz` to exist, restores it through archive-reader, and logs translated artifacts. Its commented
source pipeline is development material, not an active archive-building command or a supported CLI.

The `test` script invokes Vitest over `src`. No current source test files are supplied for docs-compiler; this script
does not establish plugin coverage. Exploratory testing remains optional under the repository instructions. Before
production promotion, assess behavior coverage and rendering/security verification separately.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
|----------|------------|---------------|---------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Initial draft |
