---
id: async-queue-readme
standard_revision: 1
---

# @whiteeclipse/async-queue

Sequential asynchronous operations with draining disposal. This README covers the `0.1.0-alpha.1` alpha
package, extracted from the exploratory cache implementation. It uses `@whiteeclipse/log` for diagnostics and provides
built JavaScript and TypeScript declarations.

## Setup

Install the exploratory release with `bun add @whiteeclipse/async-queue@0.1.0-alpha.1`; the registry tag is `alpha`.
The workspace instructions below apply when developing this repository.

Add `"@whiteeclipse/async-queue": "workspace:*"` to a consuming workspace's dependencies and run `bun install` from the
repository root.

```ts
import { createOperationQueue } from "@whiteeclipse/async-queue";

await using queue = createOperationQueue(async () => {
    await releaseResources();
});

const result = await queue.run(async () => loadResource());
```

`loadResource` and `releaseResources` represent the consumer's own operations and cleanup. The environment must provide
`Symbol.asyncDispose`; `await using` syntax must be supported or compiled by the consumer's toolchain. The package does
not use `AsyncDisposableStack` or install a polyfill.

## API

The package exports the `OperationQueue` interface and `createOperationQueue(cleanup)` factory. State is held in a
closure, without classes. The factory accepts an asynchronous final-cleanup callback.

`queue.run(action)` admits an action in invocation order and returns its inferred result. Actions can return values or
promises, or throw synchronously. Each failure rejects its own call without blocking subsequent actions or final
cleanup.

`queue[Symbol.asyncDispose]()` immediately rejects new actions, waits for admitted actions to settle, and runs final
cleanup once. Repeated disposal joins the same cleanup task and preserves any cleanup failure. Admitted actions are not
cancelled; an action that never settles delays disposal.

Actions must not await another action queued behind themselves on the same queue, or await that queue's disposal. Either
creates a circular wait. Use ordinary internal helpers within actions, and separate queue instances for independently
owned components.

## Logging

The queue obtains a logger under `["whiteeclipse", "async-queue"]` without configuring logging. The consuming
application owns configuration; see
the [log package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/log/README.md).

`trace` records action admission, start, and completion. `debug` records queue creation, draining, cleanup, and
disposal. A call after disposal starts emits a `warning`; an action or cleanup failure emits an `error` containing the
original failure. Cleanup diagnostics run once even when disposal is repeated. Records identify queues and admitted
actions with numeric IDs scoped to the loaded module and queue respectively; action inputs and results are not logged.
Higher-level consumers, such as cache adapters, can emit their own contextual diagnostics for the same failure.

## Development

Tests cover operation ordering, result and failure preservation, draining disposal, and diagnostic levels. Logging does
not change the public API or action and cleanup results.

```sh
bun run --cwd packages/libraries/async-queue typecheck
bun run --cwd packages/libraries/async-queue test
bun run --cwd packages/libraries/async-queue lint
bunx --bun --no-install prettier --check packages/libraries/async-queue
```

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                |
|----------|------------|---------------|------------------------------------------------------------|
| 1        | 2026-10-28 | Codex         | Extract the shared queue implementation and existing tests |
| 2        | 2026-10-30 | Codex         | Add scoped queue lifecycle and action diagnostics          |
| 3        | 2026-11-04 | Akane SHIMOKA | Document alpha registry installation and release packaging |
