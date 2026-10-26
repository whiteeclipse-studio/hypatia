---
id: rfc-0004
standard_revision: 1
status: draft
---

# rfc-0004 — Internationalization support

This RFC defines reusable interface internationalization for React applications, using i18next, YAML translations, and a shared React/Vite integration package.

## Proposal

### Scope

This proposal provides consistent interface translations across adopting React applications, with French, German, and Japanese as initial translation goals.

Application content MAY opt into these conventions, but is not implicitly covered. Document translations follow the [documentation translation standard](../../standards/TRANSLATIONS.md).

### Shared package

A reusable `@whiteeclipse/i18next` package MUST provide localization using i18next and react-i18next. It MUST export a configured i18next instance and support switching its active language at runtime.

### Translation files

- Interface translations MUST use `.yaml` files in `locales/<language>`, with `locales` alongside the application's `src` directory. Nested folders and regional language names such as `fr-CA` MUST be supported.
- Each file's namespace MUST derive from its path relative to `locales/<language>`, removing `.yaml` and replacing `/` with `.`. For example, `locales/ja/blog/article-1.yaml` provides `blog.article-1:title` for its `title` entry.
- The Vite plugin MUST reject namespace collisions within a language and fail the build. For example, `blog/article.yaml` and `blog.article.yaml` collide.
- Translation lookup MUST fall back from a regional locale to its base language, then English, then the requested key: `fr-CA → fr → en → key`. The requested key MUST be displayed when no translation is found, including when English resources are absent.

### Language selection

In the browser, language preference MUST be resolved in this order:

1. The saved preference in `localStorage` under `@whiteeclipse/locale`.
2. The browser language.
3. English.

A saved or browser preference MUST be skipped when neither that locale nor its base language has resources. Explicit language choices MUST be persisted under the same storage key and restored on later loads.

If `localStorage` cannot be read or written, localization MUST continue. Failed reads MUST skip the saved preference; failed writes MUST retain the selected language for the current session.

Server rendering MUST select language from the request's `Accept-Language` header, using English when it is absent or no supported locale resolves. Regional fallback MUST follow the translation lookup rules above.

An initial locale MAY be supplied for independent renders, including static site generation (SSG). The initial client render during hydration MUST use the locale used to generate the HTML. Browser preferences MUST be applied after hydration; the resulting locale MAY differ from the initially rendered locale. Client-only rendering MUST apply the browser preference order during initialization.

### React and Vite integration

- The package MUST export a React provider using react-i18next's `I18nextProvider` and React `Suspense` for pending initialization or translation resources.
- Server and client rendering MUST be supported. Server rendering MUST work without browser-only APIs and use an isolated i18next instance per request or independent render; language changes MUST NOT affect other renders.
- The package MUST export a Vite plugin that loads application YAML translations at build time and makes all locale data available in the generated output, including for SSG.
- During development, locale additions, changes, and removals SHOULD update translation resources without restarting the Vite development server.

### Consequences

The shared package reduces repeated setup while introducing conventions and ongoing package and translation maintenance. Adoption may require reorganizing locale files and updating translation references. Incomplete translations can mix languages or expose keys; browser preferences may cause a visible language change after initial rendering. Server isolation and client initialization require careful integration.

## Alternatives considered

- **Strings embedded in components:** avoids localization infrastructure but does not provide translated interfaces.
- **Per-application i18next configuration:** allows independent choices but duplicates setup and can diverge across applications.
- **JSON translations:** viable, but YAML was preferred for human readability.
- **Runtime-only loading:** does not meet the requirement to include all locale resources in static output.

## Delivery and validation

Adopt the package by configuring its Vite plugin and React provider, moving translations into the prescribed layout, and updating namespace references. Document public exports, initialization, locale selection, and server/static rendering usage. Locale updates in static output require a new application build; deployment remains the consuming application's responsibility.

- YAML loading, namespace derivation, collision failures, and inclusion of all locale data in build output.
- Saved and browser preference selection, unsupported-locale skipping, persistence, and regional-to-key fallback, including absent English resources.
- Unavailable storage does not prevent localization: failed reads skip the saved preference, and failed writes preserve the current session's language selection.
- Runtime switching, translated rendering, and the Suspense loading fallback.
- Header-based server selection, operation without browser APIs, and isolation between concurrent requests or independent renders.
- Hydration starts with the generated HTML's locale, then applies browser preferences; client-only rendering applies them during initialization.
- Development updates for added, modified, and removed locale files, recording any limitation against the SHOULD requirement.

## Decision record

Acceptance is pending.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-22 | Akane SHIMOKA | Initial draft |
