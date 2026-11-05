---
id: website-readme
standard_revision: 1
---

# White Eclipse website

`@whiteeclipse/website` is the exploratory `0.1.0-alpha.1` application for the White Eclipse landing and documentation
modules. The documentation explorer uses the Storybook reader's Core UI foundations, compiled HAST, and React Router.
Project links open `docs/README.md`; project navigation and filtering are rooted at `docs/`. Documents outside that
folder remain available through authored links. The landing module restores the current `whiteeclipse.fr` page using
the layout, English/French copy and orbital artwork recovered from commit `25f3566`. It uses the current Core UI theme
and installed Radix icons. The portfolio and studio links target page sections; blog and contact calls to action
retain their unavailable placeholder state. The footer contact link remains a working email link.
The documentation header's White Eclipse brand links to the configured `landingOrigin`.
Optional frontmatter `parent`, `previous`, and `next` paths resolve relative to the declaring Markdown document.
The reader shows an upward arrow icon and the parent title above the page title, with previous/next links below the
article, following the Storybook reader's navigation styling. Each field works independently; missing, invalid, or
unpublished targets
produce no link. Target titles follow the selected language with English fallback. The same navigation data is used
by static pages, client navigation, and archive updates.
The documentation domain root redirects to `/hypatia`, using an HTTP redirect in development, an HTML refresh with a
fallback link in static output, and replacement navigation for client-side visits.
Documentation pages link `/manifest.webmanifest`, which sets the installed app's identity, launch URL, and navigation
scope to `/`. On `https://whiteeclipse.dev`, installations therefore launch from the domain root and keep project
switching within the app. Root-relative URLs also support local documentation origins.
The manifest and both modules' `apple-touch-icon` links use `/favicon/apple-touch-icon.png`, the supplied 1024 × 1024
light Icon Composer PNG export. Browser tab favicons retain their existing artwork.
The PNG is static and does not provide native Liquid Glass layers or automatic light/dark variants.

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

Development and preview select the landing module for the hostname configured in `landingOrigin`, and documentation
for other hosts. Set `WEBSITE_MODULE=landing` or `WEBSITE_MODULE=documentation` to override that selection when using
localhost. A reverse proxy can route both configured domains to the same server.

The development HTTP port defaults to `20100`; `PORT` overrides it. Vite's development websocket uses the next port. A
reverse proxy can expose documentation at `https://docs.hypatia.local.whiteeclipse.dev` and the landing page at
`https://hypatia.whiteeclipse.dev`. Development prepares repository
snapshots but server-renders HTML only for the requested route. React Router requests page data for subsequent
navigation. Local sources update through compiler watches; remote archive sources can be refreshed with Update.
Development HTML links the SSR-discovered CSS Modules directly, keeping the landing layout styled before hydration.
Vite also transforms linked workspace JavaScript to the ES2022 target during development, lowering syntax such as
`await using` before Safari receives the compiler modules.

## Configuration

Edit `website.config.ts`, or set `WEBSITE_CONFIG` to a custom TypeScript configuration file. Relative configuration
paths
and project source paths resolve from `apps/website`. The optional file is validated before source loading; invalid or
missing files fail the build rather than falling back to local defaults.

`website.deployment.config.ts` selects the public domains, local Hypatia sources, and the `ryugu.tgz` asset from Ryugu's
latest GitHub release. `.do/app.yaml` builds from `feature/website` using one static-site component rooted at
`apps/website/dist`. Hostname-based ingress rewrites serve `whiteeclipse.fr` from `landing/` and `whiteeclipse.dev` from
`docs/`. The build copies the documentation fallback to the output root because App Platform requires a root filename
for its shared error document. The original domain aliases and redirects are retained. Run the same build locally with:

```sh
bun run build:packages
WEBSITE_CONFIG=website.deployment.config.ts bun run --cwd apps/website build
```

Publication restrictions and production approval remain pending as described above; the prepared spec is not an
approval.
Ryugu's release workflow keeps the archive filename stable. A new website build fetches the latest archive directly
from GitHub. Browser updates require a CORS-enabled `archiveUrl`; GitHub's release download redirects are blocked by
browser CORS checks. The [archive reverse proxy](../reverse-proxy/README.md) provides a Worker endpoint for those
updates. Set `archiveUrl` to its deployed address and rebuild the website after deploying the Worker.

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
SSR. The separate `dist/landing` output contains the complete English landing HTML, localized title and description,
canonical URL, favicon, bundled artwork, fonts, styles, hydration scripts, route inventory and sitemap. Serve that
folder at `landingOrigin`; its documentation action links to `documentationOrigin`. English/French language switching
hydrates from the generated English snapshot and then applies saved or browser preferences. Preview this output with
`WEBSITE_MODULE=landing bun run --cwd apps/website preview`. Missing landing routes return 404. The SSR build under
`.cache/ssg` is build tooling and must not be deployed.

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

Run the navigation payload regression checks with `bun test src/modules/documentation/domain/validation.test.ts`.
They cover preservation through bootstrap and page-response validation, independently authored links, and malformed
targets.

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

| Revision | Date       | Author        | Description                                                     |
|----------|------------|---------------|-----------------------------------------------------------------|
| 1        | 2026-11-04 | Akane SHIMOKA | Introduce the exploratory documentation website                 |
| 2        | 2026-11-04 | Akane SHIMOKA | Restore the landing page and its static output                  |
| 3        | 2026-11-04 | Akane SHIMOKA | Document custom configuration and temporary App Platform builds |
| 4        | 2026-11-04 | Codex         | Document optional parent and reading-sequence navigation        |
| 5        | 2026-11-04 | Codex         | Document navigation payload regression checks                   |
| 6        | 2026-11-04 | Codex         | Document development transforms for linked workspace JavaScript |
| 7        | 2026-11-04 | Akane SHIMOKA | Document single-site deployment and Ryugu release archives      |
| 8        | 2026-11-04 | Codex         | Link the archive Worker for CORS-enabled browser updates        |
| 9        | 2026-11-05 | Codex         | Document the root-scoped documentation web app manifest         |
| 10       | 2026-11-05 | Codex         | Document the supplied PWA and iOS Home Screen icon              |
| 11       | 2026-11-05 | Codex         | Use the shared favicon touch icon for both website modules      |
