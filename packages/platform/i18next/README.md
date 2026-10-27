---
id: i18next-package-readme
standard_revision: 1
---

# @whiteeclipse/i18next

Shared interface localization for React applications. This README covers the private `0.1.0-alpha.1` workspace package, currently being reimplemented one responsibility at a time.

This is exploratory pre-production work under draft [RFC-0004 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0004-internationalization.md). Acceptance remains pending. The current implementation provides the translation catalogue, language selection, independent localization sessions, browser preferences, request-header preference parsing, React integration, browser bootstrap, and Vite YAML loading. The previous prototype is preserved in `src.old`.

## Setup

Add `"@whiteeclipse/i18next": "workspace:*"` to the consuming workspace's dependencies and run `bun install` from the repository root. Build the package with `bun run --cwd packages/platform/i18next build` before consuming it. TypeScript entrypoints use conditional exports: `types` selects adjacent declarations in `dist`, `development` selects TypeScript source, and `default` selects built JavaScript in `dist`. Source files are also included for consumers selecting the development condition. The catalogue itself has no runtime dependencies and works without browser APIs, React, or i18next.

Language selection also works without browser APIs, React, or i18next. Localization sessions use i18next and work without browser APIs or React. React integration requires React 19; the optional Vite integration requires Vite 8. YAML parsing and filesystem access remain in the build integration.

Node loads Storybook’s configuration before Vite resolution is available. Imports used by that configuration use explicit source filenames such as `../catalogue/index.ts`; the build rewrites TypeScript extensions to JavaScript extensions. The default Vite plugin export can therefore load directly in Node after building, without a directory-import resolver override.

## Source organization

`src/catalogue/` contains the catalogue, its types, and shared locale normalization and base-language helpers. `src/preferences/` contains browser preferences, request-header parsing, and locale selection. `src/session/` owns the localization engine. `src/react/` owns rendering, hydration, and React language actions. `src/browser/` bootstraps the shared browser instance. `src/vite/` loads YAML, exposes the generated catalogue module, and watches development sources. Tests remain next to their sources. `src/index.ts` exposes the runtime API; Vite and catalogue-only imports use separate entrypoints.

## Catalogue responsibility

The catalogue describes the locales, namespaces, and messages supplied by an application. It owns a validated copy of that data and exposes a deeply read-only snapshot that can be serialized as JSON.

Each entry supplies a locale identifier, a namespace identifier, and parsed messages. Locale identifiers are normalized as BCP 47 language tags; `fr-ca` and `fr-CA` identify the same locale. Namespaces have non-empty names, and each locale–namespace pair has exactly one source. Repeated pairs are rejected rather than merged or overwritten.

A namespace contains a mapping of message keys to strings, nested mappings, or lists of those values. Numbers, booleans, null, class instances, functions, and circular references are rejected. A declared empty string is retained as a message; empty mappings and lists contain no messages. Ordinary shared object references are allowed and copied.

Every locale must contain at least one string message across its namespaces. A locale containing only empty namespaces or nested empty containers is rejected, even when other locales contain messages. Individual empty namespaces are allowed when the same locale has messages elsewhere. A completely empty catalogue is valid.

Locales may have different namespaces and message keys. English resources are optional. The catalogue does not fill gaps or select an active language; those are responsibilities of language selection and localization sessions. File parsing, filename-to-namespace conversion, and source-file diagnostics belong to the loading integration.

## Usage

```ts
import { createCatalogue } from "@whiteeclipse/i18next";

const catalogue = createCatalogue([
    { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
    { locale: "fr", namespace: "reserved", messages: {} },
    { locale: "ja", namespace: "blog.article-1", messages: { title: "記事" } },
]);

const locales = Object.keys(catalogue);
const frenchNamespaces = Object.keys(catalogue["fr"] ?? {});
const title = catalogue["fr"]?.["common"]?.["title"];
```

Both the original input and the published catalogue remain independent: editing source objects later does not change the catalogue, and constructing a catalogue does not freeze the caller's objects. Published mappings and lists are frozen recursively. Consumers needing mutable engine resources can create their own copy in the later session integration.

`JSON.stringify(catalogue)` serializes its data directly. It contains no engine instance, file handles, browser state, or rendering state. Development updates will supply a replacement catalogue.

## Language selection

`selectLocale(preferences, catalogue)` checks locale preferences in their supplied order against a validated catalogue. A preference is supported when either its exact locale or its base language exists. Malformed and unsupported preferences are skipped. Locale names are canonicalized using the same BCP 47 conventions as the catalogue.

The first supported preference wins, retaining its regional identifier. For example, preferences `es-MX, fr-CA, ja` with a catalogue containing `fr` and `ja` select `fr-CA`. A later exact match does not outrank an earlier preference supported by its base language. A base language or sibling region does not match a catalogue containing only a different regional variant.

When no preference resolves, selection returns `en`, including when English resources are absent or the catalogue is empty. Selecting a locale neither changes translation data nor changes an active engine language. Browser preference reading and request-header parsing produce ordered inputs; a localization session applies the selected locale and handles translation lookup fallback.

```ts
import { selectLocale } from "@whiteeclipse/i18next";

const locale = selectLocale(["es-MX", "fr-CA"], catalogue);
// fr-CA, supported by the French messages in the catalogue above.
```

## Localization sessions

`createSession(catalogue, locale)` returns a promise of an initialized i18next instance. Each invocation creates an independent engine and deep-copies the catalogue into a private resource store. Create one session for each independent server request, static render, or browser application. Language changes and resource mutations remain local to that session.

Supply the locale returned by `selectLocale`, or an explicit valid locale for an independent render. The default is `en`. Invalid locale identifiers reject initialization. Shared locale utilities keep normalization and base-language handling consistent between selection and session fallback.

Lookups check the active locale, its base language, English, then the requested key. Missing English resources are allowed. Requested keys retain their explicit namespace, and supplied `defaultValue` text does not replace a missing key. Namespace-qualified lookups are recommended; unqualified keys use i18next's `translation` namespace. Interpolation, plural forms, nested keys, and ordered fallback-key lists remain available. Interpolation produces plain text for consuming renderers to escape appropriately.

```ts
import { createSession } from "@whiteeclipse/i18next";

const session = await createSession(catalogue, locale);
const title = session.t("common:title");

await session.changeLanguage("ja");
const articleTitle = session.t("blog.article-1:title");
```

The session is the actual i18next instance. Keep that stable instance as the target of language-changing actions. For a fixed-language view, `session.getFixedT("fr", "common")` returns a translator function bound to French; changing the session language does not change that function's language. This separates fixed-language reads from mutable session state without creating another mutable engine. Browser persistence is provided by the preference functions below; React coordinates hydration without cloning the session.

## Browser preferences

`readBrowserPreferences()` returns the saved locale under `@whiteeclipse/locale`, followed by `navigator.languages` in its existing order. If the browser's language list is empty, it uses `navigator.language`. The returned array is independent of the browser's array. Invalid or unsupported saved values remain in the list for `selectLocale` to skip, keeping language-selection policy in one place. English fallback also remains the selection policy's responsibility.

`rememberLocale(locale)` attempts to write an explicit choice under the same storage key. Change the session language successfully before remembering its active locale. Denied storage reads skip the saved preference; denied writes are ignored, leaving the selected session language active. Both inaccessible storage properties and throwing storage methods are handled.

For client-only initialization and an explicit language change:

```ts
import { readBrowserPreferences, rememberLocale } from "@whiteeclipse/i18next";

const browserLocale = selectLocale(readBrowserPreferences(), catalogue);
const browserSession = await createSession(catalogue, browserLocale);

await browserSession.changeLanguage(selectLocale(["ja"], catalogue));
rememberLocale(browserSession.language);
```

A later client-only load can use the same initialization sequence to restore the saved preference. During hydration, the initial locale must instead come from the generated HTML; the React provider applies browser preferences after mounting. Outside the browser, reading returns an empty list and remembering a locale does nothing. The functions do not read browser state at module import time.

## Request preferences

`parseAcceptLanguage(header)` accepts the request's raw `Accept-Language` header, including `null` or `undefined` when absent. It returns language ranges in descending quality order. An omitted `q` weight means one; equal weights retain their header order. Zero-quality ranges and entries with malformed weights, unknown parameters, or repeated parameters are ignored. Quality values range from zero to one with at most three decimal places.

The parser trims surrounding whitespace while retaining the range's original identifier. Locale validation, normalization, and catalogue availability remain with `selectLocale`. Wildcards do not identify a concrete locale, so selection skips them; when no concrete preference resolves, it supplies English. An absent or empty header produces an empty preference list and therefore also selects English, even without English resources.

```ts
import { parseAcceptLanguage } from "@whiteeclipse/i18next";

const requestPreferences = parseAcceptLanguage("fr-CA,ja;q=0.8");
const requestLocale = selectLocale(requestPreferences, catalogue);
const requestSession = await createSession(catalogue, requestLocale);
```

Read the header from the consuming server framework and pass its string value to the parser. This keeps preference parsing independent of a particular Request type or browser API. Create a fresh session per request; parsed request preferences never modify a shared session or browser preference.

## Browser bootstrap

`i18n` is the exported, configured browser instance. Importing it does not initialize resources or read browser state. Call `initializeBrowser(catalogue)` once before rendering to initialize that same instance using saved/browser preferences. Its promise can be passed directly to the provider and its loading boundary:

```tsx
import { i18n, initializeBrowser, I18nProvider } from "@whiteeclipse/i18next";

// Create this promise outside component rendering, in the browser entrypoint.
const pendingSession = initializeBrowser(catalogue);
const application = (
    <I18nProvider session={pendingSession} catalogue={catalogue} fallback="Loading…">
        <Greeting />
    </I18nProvider>
);

// After pendingSession resolves, i18n is the same initialized session.
```

For hydration, call `initializeBrowser(catalogue, htmlLocale)` instead and pass `initialLocale={htmlLocale}` to the provider. The explicit locale is canonicalized and preserved even when it has no resources; browser preferences are not read during this initialization. The provider applies them after mounting. Malformed explicit locales reject initialization rather than silently choosing a different locale.

The shared instance uses the same session configuration and private resource copying as `createSession`. `initializeBrowser` rejects outside the browser. Server requests and static renders must continue to use their own `createSession` instances and pass them explicitly to the provider; importing the browser export does not affect those sessions. Initialization is application bootstrap, not a runtime language-change operation. Use `useLocale().changeLocale` for persisted choices or the session methods and preference functions for explicit manual control.

## React integration

`I18nProvider` receives a session and its catalogue. It supplies react-i18next's `I18nextProvider` and a Suspense boundary. Pass an initialized session, or a stable `createSession` promise created outside rendering; `fallback` is displayed while initialization or translation resources are pending. Rejected initialization and language changes propagate to an enclosing error boundary.

```tsx
import { I18nProvider, useLocale, useTranslation } from "@whiteeclipse/i18next";

function Greeting() {
    const { t } = useTranslation("common");
    const { locale, changeLocale } = useLocale();

    return (
        <section lang={locale}>
            <h1>{t("title")}</h1>
            <button onClick={() => void changeLocale("ja")}>日本語</button>
        </section>
    );
}

// Use the browserSession initialized from preferences in the example above.
const application = (
    <I18nProvider session={browserSession} catalogue={catalogue} fallback="Loading…">
        <Greeting />
    </I18nProvider>
);
```

For client-only rendering, select browser preferences before creating the session, as shown above. For server or static rendering, create an independent session for the selected request or explicit locale. During hydration, create the client session with the locale used to generate the HTML and pass that same value as `initialLocale` on both server and client. Transfer that locale through the consuming application's page data. Browser preferences are then applied after mounting. Set `applyBrowserPreferences={false}` for a view that should retain its explicit locale.

Use this package's `useTranslation`, `Trans`, and `useLocale` within the provider. Each consumer preserves the generated locale for its first hydration render, including consumers inside delayed Suspense boundaries. Subsequent renders follow session language changes. `Trans` supports rich translated content through the upstream component.

`useLocale()` exposes the render's `locale`, the original `session`, and `changeLocale(locale)`. The action changes the session, then remembers its successful choice; storage failures leave the new language active. Automatic preference application does not persist an implicit choice. `useTranslation()` retains the upstream hook's tuple and object forms, namespace typing, and options, while returning the original engine as `i18n`. Its translation function uses the render locale; `i18n.language` describes the live session and may already differ during delayed hydration. Explicit `lng`, `i18n`, or translator overrides remain caller-controlled and must match the HTML when used during hydration. Direct calls to `session.changeLanguage` also update React, but persistence requires `rememberLocale` or `changeLocale`.

## Vite integration

Add the plugin to the consuming application's Vite configuration:

```ts
import { defineConfig } from "vite";
import { i18nextPlugin } from "@whiteeclipse/i18next/vite";

export default defineConfig({ plugins: [i18nextPlugin()] });
```

The plugin reads `locales/<language>/**/*.yaml` alongside the application's `src` directory, using Vite's resolved root by default. For wrappers such as Storybook, `i18nextPlugin({ root: applicationRoot })` accepts an absolute application root or a path relative to Vite's root.

For example, `locales/ja/blog/article-1.yaml` containing `title: 記事` produces the namespace `blog.article-1` and lookup key `blog.article-1:title`. Only `.yaml` files are loaded; other extensions and symlinks are ignored. An absent locales directory is allowed. Empty or comment-only YAML documents represent empty namespaces; a locale containing only empty namespaces is rejected. Explicit YAML null values remain invalid.

The loader parses YAML and supplies path-derived entries to `createCatalogue`. Malformed YAML, duplicate mapping keys, excessive alias expansion, invalid catalogue data, empty locales, and namespace collisions fail the build, even if the virtual module is not imported. Diagnostics identify source paths. Canonically equivalent locale folders share one identity, and nested versus dotted file paths can collide within that identity.

Add `"@whiteeclipse/i18next/vite/client"` to the consuming TypeScript configuration's `compilerOptions.types`, retaining its existing entries such as `"vite/client"`. Then import the generated catalogue in browser or server code:

```tsx
import catalogue from "virtual:whiteeclipse-locales";
import { initializeBrowser, I18nProvider } from "@whiteeclipse/i18next";

const session = initializeBrowser(catalogue);
const application = (
    <I18nProvider session={session} catalogue={catalogue} fallback="Loading…">
        <Greeting />
    </I18nProvider>
);
```

The virtual module exports the immutable catalogue as both its default and named `catalogue` export. It includes every locale for client and SSR builds, so static generation can create an independent session for each desired locale without runtime YAML requests. Generated code imports the pure `@whiteeclipse/i18next/catalogue` entrypoint, which exports the catalogue factory and types without browser or React setup. YAML parsing and filesystem dependencies stay out of application output.

During development, YAML additions, changes, and removals invalidate the catalogue in every Vite environment and request a full page reload. This includes the first locale added to an initially absent directory. The Vite server stays running; the page reload recreates application sessions and loses transient page state. Static output requires a new build after translation changes.

## Public exports

| Export                                         | Purpose                                                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `createCatalogue(entries)`                     | Validate, copy, and freeze parsed translation groups into a catalogue. Throws for invalid data, duplicate identities, or empty locales. |
| `selectLocale(preferences, catalogue)`         | Choose the first supported preference, preserving its region, or return English.                                                        |
| `createSession(catalogue, locale?)`            | Create a promise of an initialized, independent i18next instance, defaulting to English.                                                |
| `readBrowserPreferences()`                     | Read saved and browser locale preferences in priority order.                                                                            |
| `rememberLocale(locale)`                       | Attempt to persist an explicit choice without changing session state.                                                                   |
| `localeStorageKey`                             | The shared `@whiteeclipse/locale` storage key.                                                                                          |
| `parseAcceptLanguage(header?)`                 | Parse request language ranges into quality-ordered preferences.                                                                         |
| `i18n`                                         | The configured browser instance; initialized explicitly with application translations.                                                  |
| `initializeBrowser(catalogue, initialLocale?)` | Initialize the browser instance from preferences or a generated HTML locale.                                                            |
| `I18nProvider`, `I18nProviderProps`            | Provide the session, loading boundary, and hydration configuration.                                                                     |
| `useLocale()`                                  | Read the render locale and stable session; apply and persist explicit choices.                                                          |
| `useTranslation()`, `Trans`                    | Render ordinary and rich translations with per-consumer hydration snapshots.                                                            |
| `CatalogueEntry`                               | A source group with `locale`, `namespace`, and unvalidated `messages`.                                                                  |
| `TranslationCatalogue`                         | The read-only locale → namespace → messages data shape.                                                                                 |
| `Messages`, `MessageValue`                     | Read-only namespace mappings and supported nested values.                                                                               |

The `./vite` entrypoint exports `i18nextPlugin` and `I18nextPluginOptions`; `./vite/client` declares the virtual module. The `./catalogue` entrypoint exports `createCatalogue` and the catalogue types listed above.

## Verification

From the repository root:

```sh
bun run --cwd packages/platform/i18next build
bun run --cwd packages/platform/i18next typecheck
bun run --cwd packages/platform/i18next test
bunx --bun --no-install eslint packages/platform/i18next/src
bunx --bun --no-install prettier --check packages/platform/i18next/src packages/platform/i18next/README.md
```

Unit tests live alongside their sources in `.spec.ts` and `.spec.tsx` files. The catalogue checks cover empty-locale rejection, incomplete translations, canonical identities, duplicate rejection, serialization, ownership, deep immutability, supported message shapes, and cyclic versus shared references. Selection checks cover preference order, exact and base-language availability, regional identifiers, malformed preferences, English defaults, and unchanged inputs. Session checks cover initialization, regional lookup fallback, absent English resources, strict missing-key behavior with supplied defaults, interpolation, plurals, namespace paths, independent language and resource state, runtime switching, and fixed-language reads. Browser checks cover preference ordering, navigator fallback, array ownership, unavailable storage, restoring explicit choices, and operation without browser APIs. Request checks cover weighted ranges, stable ordering, zero-quality exclusions, malformed weights and parameters, missing headers, regional selection, English defaults, and independent request sessions. React checks cover independent server rendering, pending initialization, client preference restoration, explicit choice persistence, retained command targets, rich translations, and delayed hydration without mismatches. Bootstrap checks cover import-time inactivity, exported instance identity, saved/browser selection, unavailable storage, absent English resources, explicit hydration locales, invalid locale rejection, runtime switching, private resources, and server guards. Vite checks cover YAML paths and validation, collision failures without an import, client and SSR build output, immutable server catalogues, custom application roots, module invalidation for additions/changes/removals, unrelated events, watcher cleanup, and the first locale added to a missing directory. The filesystem watcher integration check uses polling; event checks exercise the existing Vite watcher directly. Archived source is outside the active TypeScript and lint scope. These build checks use synthetic Vite applications. Storybook adoption and an application build are separate follow-up work; passing these checks does not establish production readiness or RFC acceptance.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author | Description                                                                |
| -------- | ---------- | ------ | -------------------------------------------------------------------------- |
| 1        | 2026-10-27 | Codex  | Add exploratory localization, Vite, and rendering guidance                 |
| 2        | 2026-10-27 | Codex  | Preserve delayed hydration locales and verify generated-page rendering     |
| 3        | 2026-10-27 | Codex  | Begin responsibility-based rewrite with an immutable translation catalogue |
| 4        | 2026-10-27 | Codex  | Colocate unit tests with their sources using spec filenames                |
| 5        | 2026-10-27 | Codex  | Add pure locale selection from ordered preferences                         |
| 6        | 2026-10-27 | Codex  | Add isolated localization sessions and strict lookup fallback              |
| 7        | 2026-10-27 | Codex  | Add browser preference reading and resilient persistence                   |
| 8        | 2026-10-27 | Codex  | Add request language preference parsing                                    |
| 9        | 2026-10-27 | Codex  | Group preference handling and consolidate catalogue locale helpers         |
| 10       | 2026-10-27 | Codex  | Add React rendering, language actions, and delayed hydration coordination  |
| 11       | 2026-10-27 | Codex  | Add browser bootstrap and share configuration with independent sessions    |
| 12       | 2026-10-27 | Codex  | Add Vite YAML loading, catalogue modules, and development reloads          |
| 13       | 2026-10-27 | Codex  | Add conditional distribution exports and Node-compatible source imports    |
