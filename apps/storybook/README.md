---
id: app-storybook-documentation-prototype
standard_revision: 1
---

# Storybook workspace

A shared workspace for exploratory component and layout proposals. It uses React, Vite, Tailwind CSS v4, and the existing [Core UI styles](../../packages/platform/core-ui/README.md). This is pre-production work under draft [RFC 0002](../../docs/internal/rfcs/0002-tech-stack.md), draft [RFC 0004](../../docs/internal/rfcs/0004-internationalization.md), and the draft [Core UI proposal](../../docs/internal/designs/core-ui/README.md); acceptance remains pending.

## Setup

From the repository root:

```sh
bun install
bun run --cwd apps/storybook dev
```

Open `http://localhost:20101`. The development server uses port 20101 and accepts the local, mac, and cok Storybook hostnames configured in `.storybook/main.ts`.

## Logging

The manager and preview initialize `@whiteeclipse/log` independently through `.storybook/logging.ts`, since they run in separate browser contexts. Initialization is asynchronous to support the manager bundle without top-level await; setup failures use the browser's existing `reportError` path. Browser environments without `process.env` use the log package's pretty console and `debug` defaults. Shell environment variables are not automatically exposed to either renderer.

Categories begin with `["whiteeclipse", "storybook"]`. `debug` records logging startup and applied manager themes and preview locales. `trace` records rendered story IDs. `error` records story rendering exceptions and locale initialization or language-change failures. Storybook's own error presentation and the existing browser reporting of footer language-change failures remain active. Story arguments, task titles, form contents, and translation payloads are not logged.

## Shared styling

The manager theme, favicon assets, and shared preview theme are restored from [commit e532bed6e34c08e66ffa0417158f1d02b9fec412](https://github.com/white-eclipse/hypatia/tree/e532bed6e34c08e66ffa0417158f1d02b9fec412/apps/storybook). The manager derives its colours and fonts from Core UI tokens. The Theme toolbar selects Light, Dark, or System for the manager and all stories. System follows operating-system changes.

Tailwind's Vite plugin processes the shared stylesheet. Use utility classes for story layouts and spacing, Radix Themes components directly for controls, and Core UI for shared colours, fonts, and interaction styling. The app stylesheet contains only imports. The viewport toolbar and Accessibility panel are available across stories. Storybook source and configuration use explicit conditional branches; a scoped ESLint rule forbids ternary operators.

## Locales

The Language toolbar selects English, French, German, or Japanese for all stories. English is the default; Storybook globals carry the selected language across stories and support sharing it through the story URL. The selection controls the preview's document language and the shared localization provider. Browser preferences are disabled in this review environment so they do not override the toolbar. Storybook's built-in manager interface remains in English; this version has no general manager localization setting, and no custom manager translations are installed.

Translations use the existing [localization package](../../packages/platform/i18next/README.md). Add YAML files under `locales/<language>/`, then use `useTranslation` from `@whiteeclipse/i18next` in components. Filenames determine namespaces; the welcome story uses `useTranslation("workspace")` with `workspace.yaml`. All stories receive the provider automatically. The development and typecheck scripts build the localization package before consuming its exports. The Vite plugin bundles the catalogue and reloads translations during development.

The welcome sample and both Core UI layouts are translated in all four languages. New proposals opt into translation through the shared hooks; static fixture text is not automatically translated. These exploratory translations still need human language review.

## Adding proposals

Place stories alongside their components anywhere under `src/`. Use titles such as `Components/<proposal>/<component>` or `Layouts/<proposal>/<layout>` to keep unrelated proposals independent. Choose story arguments, controls, and canvas layout per proposal; no documentation-specific fixtures or shell are installed globally.

`Workspace/Welcome` is a minimal setup sample. New stories automatically receive the shared theme and locale decorators and stylesheet; they do not need their own providers. Use the viewport toolbar to inspect narrow and wide layouts. Automated accessibility checks supplement manual keyboard, contrast, zoom, and screen-reader review.

## Core UI layout proposals

The [Core UI layout folder](./src/layouts/designs/core-ui/) contains exploratory compositions under `Designs/CoreUI`:

- **Team workspace:** task search, completion and creation, tabs, review table, avatars, badges, progress, tooltips, dropdown menus, and a modal form.
- **Release settings:** text fields, textarea, read-only field, select, radio group, switches, retention slider, required checkbox, save feedback, disabled publishing action, and reset confirmation.

Each layout has `Default` (no viewport override), `Desktop` (1280px), `Tablet` (834px), `Mobile` (320px), and `Dark` (desktop dark theme) stories. Use the shared viewport and theme toolbars for further comparisons. The layouts use Tailwind utilities and existing Core UI styling; no proposal-specific CSS or dependencies are added. Their `core-ui.yaml` catalogues translate visible sample content, placeholders, tooltips, accessible labels, dialogs, validation, and feedback. Each layout's language follows the shared locale toolbar.

Task completion and user-created task titles survive locale changes; task search matches the displayed translated titles and team names. Untouched release name and summary samples follow the selected locale, while edited values and control selections are preserved. Required-field errors and save feedback use the current language. Reset restores the current locale's sample values. Product names, version identifiers, and the illustrative URL remain unchanged.

All data is synthetic, edits are in memory, and publishing is disabled. Reloading the story restores its sample data. These samples illustrate the draft Core UI design, not accepted production interfaces. Review narrow-width wrapping and scrolling, task/dialog actions, keyboard operation, form validation, slider naming, reset state, feedback, and contrast before adopting them.

Exploratory checks on 2026-10-29: both layouts built and passed TypeScript, ESLint, and formatting. Standalone DOM checks covered task completion/progress, task creation and dialog dismissal, slider naming, save feedback, and confirmed reset. Both mobile layouts were visually sampled in Safari at 320px. The workspace scan reported no violations and two inconclusive checks. After fixing the unnamed slider thumb, the Japanese release layout's browser scan also reported no violations and two inconclusive checks. Localization checks covered catalogue key/interpolation parity, both layouts in all four locales, localized dialogs and required-field errors, and retention of task/form state across locale changes. Full keyboard, touch, overflow measurement, rendered contrast, and language-specific mobile review remain pending.

## Documentation layout proposal

The [documentation layout folder](./src/layouts/designs/documentation/) adds `Designs/Documentation/Reader`, with `Default` (no viewport override), `Overview`, `Desktop`, `Tablet`, `Mobile`, and `Dark` stories. It combines the Core UI proposal's existing styling with the navigation and reading structure of the [deployed website](https://whiteeclipse.dev/), the [earlier documentation app](https://github.com/whiteeclipse-studio/hypatia/tree/a69a7f5d8faed0c3c726c2d7d2134f4af5addc67/apps/documentation), and the [later website prototype](https://github.com/whiteeclipse-studio/hypatia/tree/e532bed6e34c08e66ffa0417158f1d02b9fec412/apps/website).

The reader includes project selection, translated page filtering, independent folder expansion and index navigation, overview cards, two sample articles, section links, and revision and licence dialogs. A persistent full-width bottom bar displays the site copyright, licence link, and four language controls synchronized with the manager toolbar. Below 640px, a language dropdown replaces the individual buttons. The navigation uses plain indented rows, a solid active highlight, and compact leading folder expanders. Desktop uses independently scrolling navigation, reading, and contents panes. Below 1100px the contents move into an article disclosure; below 768px navigation moves into a dialog. Tailwind utilities compose the layout with Radix Themes controls and shared Core UI styles, without additional CSS or dependencies.

English, French, German, and Japanese catalogues translate the sample interface and articles. Project and page selection survive locale changes. Content, revision history, and editor names are illustrative fixtures; these translations are not published documentation translations. Navigation is local state with no routing or history integration. Compiler integration, generated documentation, downloads, and offline behaviour are outside this prototype.

This is exploratory pre-production work related to draft [RFC 0005](../../docs/internal/rfcs/0005-documentation-publication.md). A written documentation-site design proposal and owner acceptance remain pending; this Storybook composition does not establish production requirements.

Checks on 2026-10-29: TypeScript, ESLint, formatting, and the static Storybook build passed. Standalone DOM checks covered all four catalogues, section targets, metadata dialogs, translated filtering, separate folder actions, mobile navigation dismissal, and retaining the selected document across locale changes. Safari's English Default story accessibility scan reported zero violations, 42 passes, and three inconclusive checks. Desktop appearance was sampled visually. Full keyboard, touch, contrast, and visual review across all locales and viewports remain pending.

## Checks

```sh
bun run --cwd apps/storybook typecheck
bunx eslint apps/storybook/.storybook apps/storybook/src
bunx prettier --check apps/storybook
bun run --cwd apps/storybook build
```

The build runs TypeScript first and emits `apps/storybook/storybook-static`. Unit and integration tests are omitted during this exploratory setup; browser appearance and theme synchronization require visual review before production use.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                               |
| -------- | ---------- | ------------- | ------------------------------------------------------------------------- |
| 1        | 2026-10-29 | Akane SHIMOKA | Establish the localized Storybook workspace and Core UI layout studies    |
| 2        | 2026-10-29 | Codex         | Add the exploratory documentation reader and record its checks            |
| 3        | 2026-10-29 | Codex         | Simplify documentation navigation rows and folder expanders               |
| 4        | 2026-10-29 | Codex         | Align the compact continuation action to the bottom right                 |
| 5        | 2026-10-29 | Codex         | Tighten documentation navigation typography and spacing                   |
| 6        | 2026-10-29 | Codex         | Use shared Core UI corner frames for folder expanders                     |
| 7        | 2026-10-29 | Codex         | Remove diagonal arrows and use an outline revision trigger                |
| 8        | 2026-10-29 | Codex         | Highlight the current section while scrolling the documentation reader    |
| 9        | 2026-10-29 | Codex         | Reduce folder frames while preserving a larger pointer target             |
| 10       | 2026-10-29 | Codex         | Remove ternary operators throughout Storybook and enforce the restriction |
| 11       | 2026-10-29 | Codex         | Size and align navigation markers to the first text line                  |
| 12       | 2026-10-29 | Codex         | Remove Radix ghost padding from compact folder controls                   |
| 13       | 2026-10-29 | Codex         | Centre navigation markers against the full wrapped title                  |
| 14       | 2026-10-29 | Codex         | Use an uppercase Outfit wordmark and larger documentation header icon     |
| 15       | 2026-10-29 | Codex         | Reduce the documentation wordmark weight to light                         |
| 16       | 2026-10-29 | Codex         | Restore the site bottom bar with synchronized language controls           |
| 17       | 2026-10-29 | Codex         | Use a language dropdown in the bottom bar below 640px                     |
| 18       | 2026-10-29 | Codex         | Allow the bottom-bar licence link to wrap independently                   |
| 19       | 2026-10-29 | Codex         | Keep bottom-bar legal text and language selection side by side            |
| 20       | 2026-10-29 | Codex         | Remove the empty browse-button icon slot to balance its spacing           |
| 21       | 2026-10-30 | Codex         | Initialize shared logging and record Storybook lifecycle and failures     |
