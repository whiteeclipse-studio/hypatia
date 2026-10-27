---
id: rfc-0002
standard_revision: 1
status: draft
---

# rfc-0002 — Technology stack

This RFC defines Hypatia's reusable technology stack and the hosting choices for its applications.

## Proposal

### Scope

This proposal defines Hypatia's base technologies, its `storybook` and `website` applications, and their rendering and hosting requirements. Coding and testing conventions, internationalization, UI design, specific Storybook stories, and documentation import and publication mechanisms are outside its scope.

### Technologies

The repository MUST use the following technologies where applicable:

| Technology   | Responsibility                                                                           |
| ------------ | ---------------------------------------------------------------------------------------- |
| TypeScript   | Source language                                                                          |
| Bun          | Development runtime, package management, script execution, and reusable package bundling |
| Vite         | Application development server and bundling                                              |
| React        | Application interfaces and reusable UI components                                        |
| CSS Modules  | Component styling                                                                        |
| Tailwind CSS | Utility classes for styling                                                              |
| Storybook    | Component development, examples, and review                                              |

Additional dependencies MAY complement these choices but MUST NOT replace them. Applications MUST use Vite for bundling. Reusable package distributions that require bundling MUST use Bun's built-in bundler.

### Applications

#### Storybook

The `storybook` application MUST provide a component development and review environment exposed at `storybook.whiteeclipse.fr`. This RFC requires the application to exist but does not prescribe specific stories or component coverage.

#### Website

The `website` application MUST provide the following two modules and deployment mappings:

| Module        | Responsibility                                                   | Output folder |
| ------------- | ---------------------------------------------------------------- | ------------- |
| Landing       | Present White Eclipse through a landing page and its child pages | `/landing`    |
| Documentation | Publish the `docs` directories of Hypatia and other repositories | `/docs`       |

Output folders are relative to the website build output root. Each domain MUST serve its corresponding folder at the domain root.

All landing, child, and documentation pages MUST use static site generation (SSG) with support for client-side hydration. Each page MUST support custom HTML metadata included in its generated HTML.

### Hosting

The `storybook` and `website` applications MUST be statically bundled and deployed using DigitalOcean App Platform's static sites offering.

Reusable packages MUST NOT assume that consumers use static bundling or DigitalOcean. Consumers choose their own bundling and hosting.

### Consequences

The shared stack supports consistent development and reuse while limiting technology choices and requiring dependency maintenance. Static generation simplifies hosting but requires rebuilding to publish content changes. Hosting the website's two modules on separate domains requires coordinated output and routing configuration.

## Alternatives considered

- **Request-time server rendering:** adds hosting cost and operational maintenance with limited benefit for the landing page and documentation. Build-time generation better suits these applications while retaining client-side hydration.
- **Other languages, including Python and Rust:** TypeScript was preferred for the project owner's existing expertise and ease of maintaining the workspace.
- **Node.js with npm or pnpm:** Bun was preferred for its speed and integrated runtime, package management, and script execution.

## Delivery and validation

- Both applications build with the declared technologies for static hosting.
- Reusable package distributions use Bun's built-in bundler; application bundling uses Vite.
- Generated landing, child, and documentation pages contain their content and custom metadata before client-side JavaScript runs; hydration enables their interactive behaviour.
- The website emits separate `/landing` and `/docs` folders.

## Decision record

Acceptance is pending.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                   |
| -------- | ---------- | ------------- | --------------------------------------------- |
| 1        | 2026-10-19 | Akane SHIMOKA | Initial draft                                 |
