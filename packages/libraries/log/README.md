---
id: log-readme
standard_revision: 1
---

# @whiteeclipse/log

Typed LogTape configuration builders and console, JSON, and Sentry sink factories. This README covers the private
`0.1.0-alpha.1` workspace package. It exposes TypeScript source and is an exploratory port of Arcadia's logging library,
authorized by its author in the 2026-10-30 porting request. Repository placement and tooling follow the exploratory
scope of draft
RFCs [0001](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0001-repository-structure.md)
and [0002](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0002-tech-stack.md); production
adoption remains pending.

## Setup and usage

Add `"@whiteeclipse/log": "workspace:*"` to the consuming workspace's dependencies, then run `bun install` from the
repository root. Configure logging once in the application entrypoint. No current Hypatia consumers are wired to this
package.

```ts
import { getLogger, makeDefaultLogConfigurationBuilder } from "@whiteeclipse/log";

await using logging = await makeDefaultLogConfigurationBuilder().apply();
getLogger(["hypatia", "example"]).info("Hello {name}", { name: "world" });
```

The main entrypoint re-exports LogTape's `getLogger` and `Logger` type so consumers can obtain categorized loggers
without a separate direct LogTape dependency. For additional LogTape APIs, such as `reset`, declare
`@logtape/logtape@2.3.4` directly.

Keep `logging` alive for the application's lifetime. Disposal resets the configuration and flushes buffered console
records. Repeated disposal is harmless, and an old handle does not reset a subsequently installed configuration. LogTape
configuration is global; a second `apply()` rejects while a configuration is active. Do not race configuration changes
with shutdown.

`NODE_ENV=production` selects JSON lines with an `info` fallback threshold; other values select pretty console output
with a `debug` fallback. `LOG_LEVEL` overrides that threshold and accepts `trace`, `debug`, `info`, `warning`, `error`,
or `fatal` (case-sensitive). Missing or empty `LOG_LEVEL` uses the fallback; other values throw a `TypeError` when
building the configuration. LogTape's internal diagnostics remain at `warning` and above.

Explicit `production` and `lowestLevel` options take precedence over the corresponding environment variables. For
example, `{ production: false, lowestLevel: "trace" }` selects pretty output at `trace` regardless of the environment.
Supply `console` to override the output destination. Environment variables are read when the builder is called. Runtimes
without a `process` global use the same fallbacks and explicit options.

The consumer's runtime or compilation target must support explicit resource management (`Symbol.dispose`,
`Symbol.asyncDispose`, and `await using`). No polyfill is installed. The main export imports no Sentry integration and
assumes no Node or Bun globals.

For import-only initialization using the environment-based defaults:

```ts
import "@whiteeclipse/log/default";
```

This side-effectful entrypoint applies the environment-based default configuration during module evaluation. It requires
top-level await support and configures logging once per module instance. Import it before logging begins and while no
other LogTape configuration is active; setup failures reject the import.

Its default export is the disposable configuration handle. Keep it alive for the application's lifetime and await its
disposal to flush and clear the configuration:

```ts
await using logging = (await import("@whiteeclipse/log/default")).default;
// Run the application within this scope.
```

Repeated imports return the same handle; importing again after disposal does not reconfigure logging. Import-only
initialization still relies on LogTape's runtime shutdown hooks or an explicit `reset()`. Use the builder above to
customize defaults or configure a fresh lifetime.

## Custom configuration

```ts
import { makeLogConfigurationBuilder, makeLogJSONSinkFactory } from "@whiteeclipse/log";

await using logging = await makeLogConfigurationBuilder()
    .withSink(makeLogJSONSinkFactory().withMessage("rendered"))
    .withLogger({ category: ["hypatia"], sinks: ["json"], lowestLevel: "info" })
    .apply();
```

Sink factories are also available individually from `@whiteeclipse/log/sink/console`, `@whiteeclipse/log/sink/json`, and
`@whiteeclipse/log/sink/sentry`.

Builders and formatter setters return new objects. `withSink` and `withFilter` reject duplicate names, while
`withLogger` constrains sink and filter names to registered factories. Factories expose a name and a `build()` method,
which may return a resource or a promise. Failed setup attempts clean up acquired resources; cleanup attempts continue
after failures and report aggregate errors. When a resource provides both disposal protocols, asynchronous disposal
takes precedence. Factories should produce fresh resources for each application.

The port retains Arcadia's `configuration/factory/sink` structure and factory names. Deliberate differences are explicit
defaults, literal-name inference, safer cleanup, Hypatia formatting, and the separate Sentry export. Arcadia can
re-export the main entrypoint and `/sink/sentry` together to preserve its existing import surface.

## Sentry integration

Install `@logtape/sentry@2.3.4` and an appropriate Sentry SDK in the consuming application. The integration is an
optional peer dependency. Import `makeLogSentrySinkFactory` and `LogSentrySinkFactory` from
`@whiteeclipse/log/sink/sentry`, and pass the SDK namespace already initialized by the application:

```ts
import { makeLogConfigurationBuilder } from "@whiteeclipse/log";
import { makeLogSentrySinkFactory } from "@whiteeclipse/log/sink/sentry";

// Sentry is the namespace initialized by the application's runtime-specific SDK.
await using logging = await makeLogConfigurationBuilder()
    .withSink(makeLogSentrySinkFactory(Sentry))
    .withLogger({ category: ["hypatia"], sinks: ["sentry"], lowestLevel: "trace" })
    .apply();
```

The factory defaults to breadcrumbs from `trace` and structured logs from `info`; its second and third arguments
customize those thresholds. Structured logs require the SDK's logging feature to be enabled. The factory does not
initialize or close Sentry; application shutdown must flush the SDK separately. Tests use a synthetic SDK namespace and
send no telemetry.

A broader White Eclipse Sentry wrapper is a separate proposed integration, not implemented by this port. It can supply
the initialized namespace while owning runtime setup and shared reporting policy.

## Development

```sh
bun run --cwd packages/libraries/log typecheck
bun run --cwd packages/libraries/log lint
bun run --cwd packages/libraries/log test
bunx --bun --no-install prettier --check packages/libraries/log
```

## Copyright and licence

Copyright © 2017–2026 Zimproov. Copyright © 2026 White Eclipse.

Ported with the author's explicit permission and released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author | Description                                                                |
|----------|------------|--------|----------------------------------------------------------------------------|
| 1        | 2026-10-30 | Codex  | Port logging builders, environment defaults, and categorized logger access |
| 2        | 2026-10-30 | Codex  | Export the default configuration handle for application-owned disposal     |
