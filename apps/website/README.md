---
id: website-app-readme
standard_revision: 1
---

# White Eclipse website

The `@whiteeclipse/website` application renders documentation artifacts produced by `@whiteeclipse/documentation-builder`. This README covers `2026.1.0-alpha.1`, an exploratory first version of the website's documentation module.

This work explores [RFC-0002 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0002-tech-stack.md#revisions), [RFC-0003 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0003-engineering-conventions.md#revisions), [RFC-0005 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md#revisions), and the [Core UI proposal revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/designs/core-ui/README.md#revisions). These proposals remain drafts. Production promotion, publication security validation, and owner acceptance remain pending.

## Setup and development

Use Bun 1.4 or later. From the repository root:

```sh
bun install
bun run --cwd packages/platform/documentation-builder build
bun run --cwd apps/website dev
```

Open <http://localhost:20100>. Development always uses port **20100** and fails if it is occupied. The Vite configuration also permits the `hypatia.local.whiteeclipse.dev`, `hypatia.mac.whiteeclipse.dev`, and `hypatia.cok.whiteeclipse.dev` development hosts when local DNS or a proxy resolves them to this server.

The default development source is this repository. The builder processes local documentation and watches it for changes. Invalid rebuilds retain the last validated snapshot and display the builder's Vite error overlay. Development renders in the browser; static generation runs during the production build.

## Artifact builds and preview

Build the documentation artifact separately from the website:

```sh
bun run --cwd apps/website build:artifact
bun run --cwd apps/website build
bun run --cwd apps/website preview
```

The first command writes `apps/website/artifacts/hypatia.tar.gz`. The website consumes that archive without reparsing repository Markdown. Preview also uses <http://localhost:20100> with strict port checking.

To consume another prebuilt artifact without changing configuration:

```sh
DOCUMENTATION_ARTIFACT=https://example.org/hypatia.tar.gz bun run --cwd apps/website build
```

An absolute local archive path also works. Relative artifact paths resolve from `apps/website`. Artifact download and validation failures fail the build. Generated archives and build output are ignored by Git.

## Sources and routes

Edit `documentation.sources.ts` to configure more projects. Each source can specify a local development repository and a prebuilt archive path or HTTP(S) URL for production. The [builder documentation](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/platform/documentation-builder/README.md) describes configuration and the version 1 artifact contract.

The home page lists configured projects. Each project keeps its repository-name URL root and original artifact paths, such as `/hypatia/index.html` and `/hypatia/standards/AUTHORING.html`. Folder URLs ending in `/` resolve to their generated `index.html` on hosts with directory-index support. Navigation uses explicit HTML paths so it does not depend on SPA routing. Every manifest page receives a static page, including directly accessible `AGENTS.html` pages excluded from the navigation tree.

Folder expansion has a separate button from the folder's index link. The project switcher names the active project and all configured choices. On desktop, the navigation tree and article panes scroll independently within the space between the header and footer; the project selector and source repository link stay outside the navigation's scroll area. The sidebar constrains the native disclosure's `::details-content` wrapper as a flex column while open so the navigation can shrink and scroll. On narrow screens, the sidebar has a collapsible disclosure. Breadcrumbs show the project, source directories, and current Markdown filename, with links to published folder indexes. Revision and © controls open the complete manifest disclosures in accessible dialogs. Revision labels use each document's own revision. The article footer provides the validated baseline artifact as a download.

The reader uses Tailwind utilities for the application shell, navigation, spacing, responsive layouts, and control compositions. Tailwind theme aliases in `src/styles/index.css` resolve colours and fonts to Core UI tokens; spacing utilities reference Core UI's spacing variables. The stylesheet places global resets in the base layer so utilities can override them. Navigation layout, selection states, page markers, and disclosure interactions use Tailwind classes; a custom Tailwind utility draws the original plus/minus artwork. A CSS Module styles the builder's generated article HTML. Radix Themes components and Core UI's shared background are used directly. Light/dark selection persists when browser storage is available, initially following the browser's colour preference. Navigation uses ordinary document links; hydration enables the interactive controls.

## Visual reference

The reader follows the composition of the [previous documentation website](https://whiteeclipse.dev/): the original eclipse logo and uppercase wordmark, a centred 1,500px frame, compact navigation, breadcrumb links, a continuous woven background, and a quiet footer. The current shared Core UI palette and self-hosted fonts remain in use. Navigation reproduces the original 16px corner-framed plus/minus controls, 16px nesting, 8px row margins, 13px folder labels, and 12px page links. Selected rows use the original solid foreground fill; the 6px square marker appears only on page links, never on folder indexes. Folder expansion remains a separate, keyboard-accessible control from index navigation. Layout and responsive styling use Tailwind; generated article typography remains in a CSS Module.

On wide screens, an “On this page” rail links to the rendered article’s existing section IDs. After hydration, its active link follows the article's scroll position and anchor navigation, using stronger text, an underline, and `aria-current="location"`. The last section remains selectable at the bottom of the article even when it is too short to reach the top of the reading pane. The rail is hidden at widths of 1,100px and below; navigation becomes a collapsible disclosure at 700px and below. The overview presents the first configured project's tree alongside links to every configured project. Floating revision and compact © controls continue to expose the complete document disclosures.

The section rail uses `rehype-parse` and `unified`, already used by the builder, to read headings from sanitized HTML consistently during SSG and hydration. These application dependencies add parsing code to the browser bundle and make no network requests. Logo assets are bundled from Core UI's explicit asset exports; the page does not depend on the old website at runtime. The previous layout and original logos are recoverable from [commit 25f3566](https://github.com/whiteeclipse-studio/hypatia/tree/25f35669fe3116680d11e7040f38eea9e47edd3f/apps/documentation).

## Static output

`build` type-checks before bundling, then generates the documentation module under `apps/website/dist/docs`. Serve **that folder at a domain root**, preserving document and asset paths. Hosting beneath a URL prefix is not supported by this first version. Configure the host to serve `404.html` for missing pages; when a host serves an HTML fallback, the hydrated reader also resolves the actual browser path and displays a missing-page view.

All document pages contain the sanitized article, page-specific title and description, navigation, and hydration data before JavaScript runs. Supporting assets, public manifests, and a content-addressed baseline archive are emitted by the builder's Vite integration. Static generation and the browser use the same sanitized snapshot. No raw Markdown or document-supplied code executes in the app.

`build-manifest.json` has its own `formatVersion: 1`. It records source repository URLs, commits, dirty state, included workspace package versions, and every deployable file, including itself. The inventory is generated from actual output and checked for completeness. Client and prerender outputs are staged; generation or validation failures preserve the previous completed `dist/docs` build. Deployment integration is separate.

Modern browsers with the capabilities required by the builder's browser reader are expected. The host must permit the builder's module worker and serve JS, CSS, fonts, assets, and archives with appropriate content types. This version embeds the build-time snapshot for hydration; it does not fetch newer versions after hydration.

## Checks and remaining work

From the repository root:

```sh
bun run --cwd apps/website typecheck
bunx --bun --no-install eslint apps/website
bunx --bun --no-install prettier --check apps/website
bun run --cwd apps/website build
```

This delivery implements the documentation module. Landing content, internationalized application labels, PWA installation, persistent offline retention and removal, browser artifact updates, and automated deployment remain deferred. The build-time snapshot remains available for normal navigation without contacting the source artifact server, but this is not an offline application-shell guarantee.

Unit and integration suites are omitted during exploration. Production promotion requires reassessing test coverage, browser and accessibility review, and the publication security validation. Passing the listed checks does not establish production readiness or proposal acceptance.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author | Description                                                       |
| -------- | ---------- | ------ | ----------------------------------------------------------------- |
| 1        | 2026-10-27 | Codex  | Add exploratory artifact-based documentation website              |
| 2        | 2026-10-27 | Codex  | Apply Tailwind utilities throughout the website layout            |
| 3        | 2026-10-27 | Codex  | Align the reader with the previous documentation website          |
| 4        | 2026-10-27 | Codex  | Restore original navigation styling with page-only square markers |
| 5        | 2026-10-27 | Codex  | Express navigation geometry and interaction states with Tailwind  |
| 6        | 2026-10-27 | Codex  | Bound sidebar scrolling and restore source-path breadcrumbs       |
| 7        | 2026-10-27 | Codex  | Highlight the current article section in the contents rail        |
| 8        | 2026-10-27 | Codex  | Constrain disclosure content for independent navigation scrolling |
