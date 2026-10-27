---
id: storybook-app-readme
standard_revision: 1
---

# @whiteeclipse/storybook

A reference application for comparing Core UI colours, typography, and layouts. This README covers the private `0.1.0-alpha.1` workspace application.

This is exploratory pre-production work under the draft [Core UI proposal](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/designs/core-ui/README.md), [RFC 0002](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0002-tech-stack.md), and [RFC 0003](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0003-engineering-conventions.md). Presets are proposals for comparison; acceptance and production validation remain pending.

## Setup

From the repository root, using the Bun version pinned in `.prototools`:

```sh
bun install
bun run --cwd apps/storybook dev
```

Open `http://localhost:20101`. Storybook binds to all interfaces on that exact port; the website's development port is reserved as `20100`.

The manager and Vite preview also accept these hostnames:

- `storybook.hypatia.local.whiteeclipse.dev`
- `storybook.hypatia.mac.whiteeclipse.dev`
- `storybook.hypatia.cok.whiteeclipse.dev`

DNS or a local hosts entry must resolve the chosen hostname to the development machine. Use port `20101` directly, or forward requests through your existing reverse proxy.

## Reviewing proposals

Storybook's sidebar, toolbar, and addon panels use Core UI's shared warm palette, Inter and JetBrains Mono fonts, rectangular panels, and the White Eclipse logo through [Storybook's manager theme API](https://storybook.js.org/docs/configure/user-interface/theming). The manager reads computed tokens from the shared stylesheet rather than maintaining a second palette. Use the **Theme** toolbar menu to select **Light**, **Dark**, or **System** for both the manager and every story. **System** is the default and follows changes to the operating-system preference. The selection carries across stories through Storybook globals. Storybook retains its own components and interactions; Radix-specific corner frames and tab treatments apply only inside the preview.

Open **Core UI → Layouts → Reference layout**. The default, compact workspace, and reading layout stories use Radix Themes components directly and import Core UI's stylesheet through Tailwind CSS v4.

**Core UI → Components → Controls** provides a standalone control study. **Core UI → Components → Loading** compares normal/loading dimensions for four button variants at sizes 1–4, with live measurement results. **Core UI → Components → Motion** reports the active reduced-motion preference and computed frame/thumb transition durations. Source files are grouped in `src/components/` and `src/layouts/`; shared application styles and CSS Modules live in `src/styles/`. Story files sit beside the studies they expose.

Use Storybook's Controls panel to change accent and neutral palettes, corner radius, scaling, spacing density, page composition, and brand versus system typography. The reference includes reading text, headings, code, forms, a dialog, feedback, action states, and twelve-step colour scales. The **Control states** tab adds select menus, read-only and disabled fields, mixed checkboxes, disabled selection controls, button variants, and a repeatable local loading preview with a status announcement. Resize the preview to review the mobile layout. Form state is local to the preview; it is not persisted or sent to a server.

Core UI self-hosts Outfit for headings and the company name, Inter for body text, and JetBrains Mono for code and annotations. These fonts are loaded by the shared stylesheet, not by the app. The system typography control provides a comparison using locally installed system fonts.

Use the Accessibility panel for exploratory checks and review keyboard navigation, focus, dialog operation, zoom, and contrast manually. Automated results alone do not establish accessibility compliance.

## Internationalization study

Open **Platform → Internationalization → Locale selection** to review the exploratory [localization package](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/platform/i18next/README.md) implementing draft [RFC-0004 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0004-internationalization.md). The proposal remains unaccepted. This study uses application-local YAML under `locales/`, beside `src/`, with English, French, Canadian French, German, and Japanese translations. It does not translate the existing Core UI studies or Storybook's manager.

Switching languages persists the explicit preference when browser storage is available. Canadian French demonstrates regional-to-base fallback; an English-only sentence and missing key expose the remaining lookup steps. Translation edits reload the preview without restarting Storybook, resetting its component state. These sample translations are exploratory and have not received human language review.

## Assets and favicon

The reference layout uses `public/favicon/icon-light.svg` and `icon-dark.svg`, extracted from the restored `favicon.svg` artwork. The theme selected in the toolbar chooses the component icon; System resolves to the current browser colour-scheme preference.

The original theme-aware SVG favicon, ICO fallback, 96px PNG, and Apple touch icon are restored from commit `25f3566` in `public/favicon`. Storybook serves these files directly and copies them into static builds. The manager and isolated preview heads reference them with relative URLs so they also work under a hosting subpath. The SVG follows the browser’s colour-scheme preference independently of the story’s selected appearance.

The reference background restores the [previous landing layout's CSS drawing](https://github.com/whiteeclipse-studio/hypatia/blob/25f35669fe3116680d11e7040f38eea9e47edd3f/apps/landing/src/layouts/site/site-layout.module.css): an 8px grid with paired arcs and aligned diagonal strokes anchored to the viewport's top-right corner. It uses the active theme's foreground and surface tokens, remains stationary while content scrolls, and ignores pointer input. The drawing is supplied by Core UI through its opt-in `core-ui-background` class; the application has no separate background stylesheet.

## Checks and build

From the repository root:

```sh
bun run --cwd apps/storybook typecheck
bunx --bun --no-install eslint apps/storybook
bunx --bun --no-install prettier --check apps/storybook packages/platform/core-ui
bun run --cwd apps/storybook build
```

The build runs TypeScript first and writes the static application to `apps/storybook/storybook-static`. Unit, component, and integration test suites have not been added during this exploratory phase. Reassess coverage before production promotion.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                 |
| -------- | ---------- | ------------- | --------------------------------------------------------------------------- |
| 1        | 2026-10-27 | Akane SHIMOKA | Add Core UI reference, visual studies, favicon, and development hosts       |
| 2        | 2026-10-27 | Codex         | Apply Core UI tokens and system appearance to the Storybook manager         |
| 3        | 2026-10-27 | Akane SHIMOKA | Organize studies and add control, loading, and motion checks                |
| 4        | 2026-10-27 | Codex         | Add exploratory internationalization study                                  |
| 5        | 2026-10-27 | Codex         | Replace appearance variants with a shared light/dark/system toolbar control |
