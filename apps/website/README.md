---
id: website-readme
standard_revision: 1
---

# White Eclipse website

`@whiteeclipse/website` is the exploratory `0.1.0-alpha.1` application for the White Eclipse landing and documentation
modules. The documentation explorer uses the Storybook reader's Core UI foundations, compiled HAST, and React Router.
Project links open `docs/README.md`; project navigation and filtering are rooted at `docs/`. Documents outside that
folder remain available through authored links. The landing module is reserved; it contains no landing content yet.

This work explores
draft [RFC-0002](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0002-tech-stack.md), [RFC-0004](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0004-internationalization.md),
and [RFC-0005](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md).
It does not record their acceptance or authorize production publication. The intended all-public publication policy
still needs an owner-approved amendment to the existing category restrictions.

## Setup

Use Bun 1.4 or later. From the repository root:

```sh
bun install
bun run --cwd apps/website dev
```

The development HTTP port defaults to `20100`; `PORT` overrides it. Vite's development websocket uses the next port. A
reverse proxy can expose the application at `https://hypatia.local.whiteeclipse.dev`. Development prepares repository
snapshots but server-renders HTML only for the requested route. React Router requests page data for subsequent
navigation. Local sources update through compiler watches; remote archive sources can be refreshed with Update.

## Configuration

Edit `website.config.ts`. Existing project entries select local repositories; paths resolve from `apps/website`.

```ts
{
    id: "example",
    name: "Example",
    source: { kind: "local", path: "../../../example" },
    buildSource: { kind: "archive", url: "https://example.com/docs.tgz" },
    archiveUrl: "https://example.com/docs.tgz",
    updateTtlMs: 86_400_000,
}
```

`source` also accepts `{ kind: "archive", url }` for remote or local archives. `buildSource` overrides it only during
SSG. `archiveUrl` is the browser update location; omit it when no remote archive exists. Update is disabled in static
output for such projects. The default update TTL is 24 hours; manual Update bypasses it. Browser configuration never
includes local source paths.

Serve archives as gzip-compressed TAR bytes. Do not label an already compressed archive with `Content-Encoding: gzip`
unless an additional HTTP compression layer was applied: browsers decode that header before the compiler receives the
bytes. Configure cross-origin archive hosting to allow the website origin and conditional request headers; expose ETag
and Last-Modified to enable HTTP validators. `.tgz` avoids the local Apache proxy's automatic `.gz` content-encoding
rule.

Set `documentationOrigin` to `https://whiteeclipse.dev` before preparing an eventual public deployment; the current
local configuration generates local canonical URLs. `landingOrigin` identifies the separate landing domain.

## Static output

```sh
bun run --cwd apps/website build
bun run --cwd apps/website preview
```

The build generates English document HTML, bootstrap snapshots, locale variants, immutable page payloads, assets, a
route inventory and a sitemap under `dist/docs`. Available document translations follow the i18next language selection
without adding a locale URL prefix. The first hydrated render uses exactly the language and data embedded in the
generated HTML.

Serve `dist/docs` at the documentation domain root. Serve directory `index.html` files and use `404.html` as the static
fallback, retaining the requested URL, so pages added by newer archives can load in the browser. Missing `_data`,
`_assets`, and application asset requests must return 404 rather than the HTML fallback. No deployed endpoint requires
SSR. The separate `dist/landing` output contains only the reserved module shell. The SSR build under `.cache/ssg` is
build tooling and must not be deployed.

A worker retains one compiler watch session per project. It restores validated archive bytes from a separate durable
IndexedDB database and invalidates its stable archive input on updates. Failed updates retain usable content; source
identity, TTL and retry metadata survive browser renders. Web Locks coordinate tabs where supported. Compiler scratch
databases are distinct and disposable.

Vite resolves the validator's `node:assert` import to the self-contained browser implementation in `@jspm/core`. The
implementation imports its own compatibility dependencies; the application injects no global `process`. SSR keeps the
compiler package external and uses its native Node assertions. Documents render through unified's `rehype-react`
compiler after HAST sanitization.

## Code organization

`src/app` composes modules and providers. `src/shared` contains reusable theme, localization and site layout.
Documentation components, layouts, routes, domain rules, React store, persistence and workers are separate folders under
`src/modules/documentation`. `src/server` owns development sources and HTTP endpoints; `src/rendering` shares page
preparation with `src/build`. Core UI remains responsible for shared visual foundations rather than website business
logic.

## Verification and limitations

Run `typecheck`, `lint`, and `build` from this workspace. Basic browser verification covers route navigation, metadata
dialogs, responsive layout, and synthetic archive updates. No full unit or integration suite is introduced for this
exploratory iteration.

Current limitations include title filtering rather than full-text search, English interface messages with
content-language fallback, no service worker or complete offline application shell, and bundled assets limited to
signature-checked PNG, JPEG, GIF and WebP. SVG, PDF, audio, video and unknown repository assets are not embedded.
Authored HTTP (S) image URLs render directly through the browser with lazy loading and no referrer; those external
images require their host to remain available. Full security and accessibility conformance, broader browser coverage,
hosting policy approval and release review remain pending before production use.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                     |
|----------|------------|---------------|-------------------------------------------------|
| 1        | 2026-11-04 | Akane SHIMOKA | Introduce the exploratory documentation website |
