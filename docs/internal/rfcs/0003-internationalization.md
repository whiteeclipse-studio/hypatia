---
id: rfc-0003
standard_revision: 1
status: draft
---

# rfc-0003 — Internationalization support

## Summary

This RFC proposes interface internationalization for any React application using i18next and react-i18next, with shared localization logic provided by a reusable `@whiteeclipse/i18next` package. YAML localization data resides in an application-local `locales` directory. Application content is not implicitly covered by these localization requirements but may opt into them.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this document follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Context and motivation

White Eclipse's React applications are intended to serve multilingual audiences. The goal is to translate their interfaces into French, German, and Japanese.

Consistent localization logic across applications is the main motivation for this proposal. A common approach would give these applications consistent conventions for integrating localization and organizing translation data.

Shared conventions are also intended to make localization easier to maintain as interfaces evolve and translations are added or updated. This RFC proposes a reusable basis for that work across React applications.

## Scope

This RFC applies to interface localization in any React application adopting this proposal. It is not limited to Hypatia's landing page or documentation website.

Application content, such as documents and articles, is not implicitly covered by these interface localization requirements. It MAY explicitly adopt this RFC's localization specification. Its storage, translation, and publication remain subject to the rules applicable to that content.

For example, the documentation website's navigation, buttons, and interface messages fall within this scope. The Markdown documents it displays are content; their translations follow the existing [documentation translation rules](../../standards/README.md#translations).

## Proposed design

Interface internationalization MUST use [i18next](https://www.i18next.com/) with [react-i18next](https://react.i18next.com/) for React integration.

### Shared package

A reusable package named `@whiteeclipse/i18next` MUST be created to provide the shared localization logic.

The package MUST export a configured i18next instance and MUST support switching its active language at runtime.

### Locale loading and fallback

Interface localizations MUST reside in language-specific `locales/<language>` directories, with `locales` alongside the application's `src` directory. Interface localization data MUST use YAML format with the `.yaml` file extension.

The package MUST support loading localization data from this directory structure and MUST use English as the default fallback language.

For a regional language, translation lookup MUST try the regional locale, then its base language, then English. For example, the lookup order for Canadian French is `fr-CA → fr → en → key`.

If a translation lookup produces no value after language fallback, the interface MUST display the requested key. This rule also applies when English fallback resources are absent.

### Namespaces

Locale directories MUST support nested folders. Each YAML file's namespace MUST be derived from its path relative to `locales/<language>`, with the YAML file extension removed and each `/` replaced by `.`.

For example, `locales/ja/blog/article-1.yaml` defines the Japanese namespace `blog.article-1`. Its `title` entry is addressed as `blog.article-1:title`.

The Vite plugin MUST reject namespace collisions within the same language and fail the build. For example, `locales/ja/blog/article.yaml` and `locales/ja/blog.article.yaml` both map to `blog.article` and MUST NOT be loaded together.

### Language selection and persistence

In the browser, the package MUST resolve the user's preferred language in the following order of preference:

1. The saved language preference in `localStorage`.
2. The browser language.
3. English as the default.

Language directory names MUST support regional variants, such as `locales/fr-CA`.

A saved or browser language preference MUST be skipped if neither the requested locale nor its base language has resources, so that the next source of preference is tried.

The package MUST persist the user's language choice in `localStorage` under the key `@whiteeclipse/locale` and restore it from that key when the application is loaded again.

For server-side rendering, language selection MUST use the request's `Accept-Language` header as its reference. English MUST be used when the header is absent or no supported locale can be resolved from it. Regional language resolution MUST follow the fallback rules above.

An initial locale MAY be supplied for rendering, including during static site generation (SSG). After the page loads in the browser, the package MUST apply the browser preference rules above. The resulting locale MAY differ from the initially rendered locale; this change is expected behaviour, including for statically generated pages.

### React integration

The package MUST export a React component that provides the configured i18next instance through react-i18next's `I18nextProvider`. The component MUST integrate with React `Suspense` to provide a loading fallback while localization initialization or required translation resources are pending.

The package MUST support both server-side rendering and client-side rendering. Server rendering MUST work without browser-only APIs such as `localStorage`.

Server-side rendering MUST use an isolated i18next instance for each request or independent render. Language changes MUST NOT affect other requests or renders.

### Vite integration

The package MUST export a Vite plugin that loads the application's YAML localization data at build time and makes it available to the configured i18next instance. All locale data MUST be included in the generated output so that it is available when an SSG application is published.

During development, the plugin SHOULD update the application's translation resources when locale files are added, changed, or removed, without requiring a Vite development-server restart.

## Consequences and drawbacks

Sharing localization logic through `@whiteeclipse/i18next` gives applications consistent conventions and reduces duplicated setup. The package, its Vite plugin, and application translations require ongoing maintenance as interfaces and dependencies evolve.

Adopting applications are constrained by the prescribed YAML directory structure and namespace rules. Existing applications may need to reorganize their translations and update translation references to follow these conventions.

Incomplete translations can produce mixed-language interfaces through fallback or expose translation keys when no value is available. Server-rendered and statically generated pages may visibly change language after loading when browser preferences differ from the initially rendered locale. This is expected behaviour under the proposed design.

Supporting server-side and client-side rendering adds initialization and integration work, particularly for isolated server instances and the transition to browser language preferences. The requirement for isolated server instances addresses language changes affecting other requests or renders.

The browser state introduced by this design is the saved language preference. Localization does not change the publication or access rules applicable to application content.

## Alternatives considered

**Keeping interface strings directly in React components:** This avoids introducing localization infrastructure but does not meet the goal of providing translated interfaces for multilingual audiences.

**Configuring i18next separately in each application:** Application-specific configuration allows independent choices but duplicates setup and can lead to inconsistent localization logic. The shared package is preferred to provide reusable conventions across applications.

**Using JSON for translation data:** YAML is preferred primarily for its human readability when authoring and maintaining translations.

**Loading locale data only at runtime:** Build-time loading is preferred because the package is intended to support SSG applications. All translation data should be available in the generated output when the site is published.

## Delivery and validation

### Adoption

Delivery begins with the exploratory `@whiteeclipse/i18next` package and its Vite plugin. Work implementing this draft remains exploratory pre-production work until the RFC is accepted. Acceptance does not establish that implementation, validation, or release is complete.

Applications can adopt the package individually by integrating its Vite plugin and React provider, moving interface translations into `locales/<language>`, and updating translation references to use the prescribed namespaces. Migration concerns translation files and application integration; no migration of other persisted application data is introduced by this proposal.

Package documentation needs to describe its public exports, initialization, React integration, locale layout, language selection, persistence, and SSR/SSG usage. Documentation for adopting applications needs to reflect their supported locales and resulting behaviour.

Locale changes included in static output are delivered through a new application build. Deployment and recovery procedures remain the responsibility of the consuming application.

### Planned validation

Validation is planned against the following observable outcomes:

- Application-local `.yaml` files load at build time, nested paths produce the specified namespaces, and the generated output contains all locale data. Namespace collisions within a language fail the build.
- Browser selection follows saved preference, browser language, then English. Unsupported preferences are skipped, and a selected language is saved and restored using `@whiteeclipse/locale`.
- Regional translation lookup follows the regional locale, base language, English, then the requested key, including when English resources are absent.
- The exported instance and React provider support translated rendering and runtime language switching. Pending initialization or required resources activate the Suspense loading fallback.
- SSR uses `Accept-Language` with English fallback, works without browser-only APIs, and isolates language changes between concurrent requests or independent renders.
- An SSR or SSG page can start with a supplied locale and change to the browser-selected locale after loading, as specified.
- The Vite development integration is checked for locale additions, changes, and removals without a server restart. Any limitation is recorded against the design's SHOULD requirement.

These are planned implementation checks, not recorded results. This RFC does not claim that the package or adopting applications have passed them. Exploratory testing remains subject to the repository's prototyping rules; production promotion requires reassessing coverage under the applicable testing requirements.

## Open questions

There are no unresolved design questions. Exact export names and signatures remain implementation details to be documented with the package before applications adopt its public interface.

## Decision record

Acceptance is pending. This RFC is a draft and does not authorize production work implementing the proposed decision.

## Revisions

| Revision | Date       | Author               | Description                                                                                                                    |
| -------- | ---------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1        | 2026-10-22 | Akane SHIMOKA, Codex | Complete draft covering localization design, consequences, alternatives, adoption, and planned validation; acceptance pending. |
