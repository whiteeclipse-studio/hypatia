---
id: rfc-0002
standard_revision: 1
status: draft
---

# rfc-0002 — Tech stack and engineering conventions
## Summary

This RFC proposes Hypatia’s technology stack as a template reusable across projects. Hypatia’s landing page and documentation websites provide implementation examples of that stack.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this document follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Context and motivation

Hypatia is designed to serve as White Eclipse's template workspace. Its documentation website and landing pages provide examples of how that workspace can be used.

Its structure MUST be reusable, and its technology choices should be flexible enough to support reuse in other projects.

The applications in this repository MUST be statically bundled. Hypatia's deployment target is DigitalOcean App Platform, specifically its static sites offering.

Packages exported by Hypatia MUST NOT assume that their consumers use static bundling or DigitalOcean App Platform. Consumers decide how their applications are bundled and hosted.

## Scope

This RFC describes Hypatia's base technologies, TypeScript and Bun, and required tools and libraries, including Vite, Storybook, and Radix. These technologies MUST be used in the repository.

It also defines engineering conventions covering code responsibilities and how code is written, documented, and tested.

The documentation requirements define what content MUST be rendered and published. Detailed rendering and presentation choices are outside this RFC's scope.

The list of packages covered by this RFC is not exhaustive. Additional packages MAY be used, but they MUST respect the core technology choices defined here and MUST NOT replace or introduce alternatives to them. In particular, Vite MUST be the only bundler used in the repository.

## Proposed design

### Technologies used in the repository

| Technology        | Responsibility                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- |
| TypeScript        | Source language, with explicit compiler type checks retained alongside builds and tests. |
| Bun               | Development runtime, package management, and script execution.                           |
| Vite              | Development server and static bundling.                                                  |
| React             | Application interfaces and reusable UI components.                                       |
| CSS Modules       | Component styling.                                                                       |
| Radix Primitives  | UI interaction primitives. The theme is provided by Core UI rather than Radix Themes.    |
| Storybook         | Component development, examples, and review.                                             |
| remark and rehype | Markdown parsing and transformation into HTML through a unified processing pipeline.     |
| i18next           | Content translation and locale management.                                               |

The repository MUST use these technologies. TypeScript compiler checks MUST remain a distinct step from bundling and test execution; their execution requirements are defined under Testing standards.

#### Documentation build and deployment

Imported Markdown documents other than `AGENTS.md` files MUST be rendered within the React/Core UI navigation shell.

The documentation build and deployment pipeline MUST:

1. Pull the `docs` directory from a configured list of public repositories. The imported source MUST always be the remote `origin/main` branch.
2. Render all Markdown documents except `AGENTS.md` files to static HTML pages within a predefined navigation shell.
3. Include supporting assets from the imported `docs` tree and rewrite relative links to published documents and assets within that tree so that they resolve in the published website. Links pointing outside `docs` MUST remain unresolved in the deployed documentation, following the [shared link boundary rules](../../standards/README.md#authoritative-sources-and-links). The build MUST NOT copy outside targets or repair those links.
4. Upload the generated static pages and supporting assets to DigitalOcean App Platform's static sites offering.

Publication SHOULD be triggered by changes in the configured source repositories and MAY also be triggered manually.

Each source repository MUST use its name as a top-level folder in the published website. For example, Cydonia documentation MUST reside under `/cydonia`, while Ganymede documentation MUST reside under `/ganymede`. Navigation within each repository folder MUST follow the source project's documentation directory structure.

Source repositories MUST be public. All imported documentation, including internal documentation and supporting assets, MUST be published with public access, except for `AGENTS.md` files.

Files named `AGENTS.md` anywhere in an imported `docs` tree MUST NOT be published as rendered pages or copied source files. They MUST NOT appear in published navigation.

Broken links originating in source Markdown are the responsibility of the source document and are outside this RFC's scope. For links to unpublished files, the build MAY emit a warning in its logs, but MUST NOT fail or repair the link solely because its target is unpublished.

The proposed pipeline MUST satisfy the [proposed documentation rendering security amendment](../../standards/GOVERNANCE.md#proposed-amendment-documentation-rendering-security). That amendment and this RFC remain pending approval; this reference does not establish adoption of an approved standard revision.

##### Build manifest and deployment preservation

Each documentation build MUST emit a JSON file named `build-manifest.json` at the root of its output directory. The manifest MUST contain a `files` array listing every file emitted into the deployable build, including generated pages, application bundles, supporting assets, and the manifest itself. Entries MUST be unique paths relative to the output root. The manifest MUST be generated from that build's actual output rather than maintained independently.

The manifest MUST identify each imported source repository and the full commit hash of the `origin/main` snapshot used for that repository's documentation. That hash MUST serve as the identifier for the imported documentation version.

Before deployment, validation MUST confirm that the manifest is valid JSON, every listed file exists within the output directory, and every emitted file is listed. A missing, invalid, or incomplete manifest MUST fail validation.

A broken build MUST NOT replace existing, deployed documentation. Source import, rendering, asset processing, manifest generation, and required validation MUST all succeed before a build is eligible for deployment. Build output MUST be prepared separately from the currently deployed documentation. Deployment MUST activate the complete validated build as a unit; a failed or interrupted upload or activation MUST leave the previous deployment available without exposing a partial replacement.

Defects discovered after a successful deployment MUST be corrected through a subsequent fixed build rather than a rollback to an earlier deployment.

### Testing standards

Tests are OPTIONAL for exploratory work not covered by an accepted RFC or design proposal. The unit, component, and integration testing requirements below do not require tests for that exploratory work.

#### Unit tests

Vitest MUST be used as the test runner for unit tests and Storybook component tests.

Unit tests SHOULD be provided for most public functions exposed by packages or applications in this repository. These tests SHOULD NOT be overly complex; exhaustive testing of every possible failure state is not required. Unit tests MAY be omitted where appropriate.

Outside the exploratory-work exemption, omission of unit tests for meaningful public behaviour MUST have a brief rationale recorded with the change. Test effort SHOULD reflect the behaviour's complexity and consequences: simple forwarding functions warrant less attention than parsing or permission checks.

#### Storybook component tests

Subject to the exploratory-work exemption above, Storybook component tests MUST cover the specified variants, states, and main interactions of supported components. Rendering a component alone does not verify its interactive behaviour.

#### Integration tests

Integration tests MUST be implemented for all applications using Playwright, subject to the exploratory-work exemption above.

These tests MUST cover each application's main user journeys and significant failure or recovery paths. The presence of a Playwright suite alone does not satisfy this requirement.

For the documentation website, integration coverage MUST verify that published pages are reachable through navigation and that valid source links to published documents and supporting assets within the imported `docs` trees resolve correctly after rewriting. It MUST also verify that `AGENTS.md` files at any depth are excluded from the deployable output and published navigation, and that links to unpublished files do not prevent publication. Relative links pointing outside `docs` MUST retain the unresolved behaviour required by the shared link boundary rules.

#### Test execution and quality

TypeScript compiler checks MUST run as part of the testing pipeline and before any build steps. Build steps MUST NOT proceed if these checks fail.

Subject to the exploratory-work exemption above, unit tests and Storybook component tests MUST run on every push through GitHub Actions and MUST pass for the latest pull request revision before merge. Integration tests MUST run against the applications' production builds and MUST pass for the latest pull request revision before merge.

Tests MUST be deterministic. Application failures MUST NOT be hidden by disabling tests or weakening assertions.

#### Promotion to production

Before exploratory code is promoted to production, its test coverage MUST be reviewed against the unit, component, and integration testing requirements above. The applicable tests MUST be implemented and passing before promotion. Any unit-test omissions MUST have the rationale required above.

### Coding standards

#### Readability and function design

Readability MUST take precedence over brevity. Code MUST be clear and as short and pure as possible without sacrificing readability. Dense expressions and unnecessary fragmentation MUST NOT be used merely to reduce line counts.

Functions SHOULD be only a few lines long and have the narrowest practical responsibility. Computation SHOULD be pure, with side effects such as network access, storage, and logging isolated in clearly identified functions.

#### File organization and public interfaces

Code MUST be split across files by responsibility. Files exceeding 200 lines SHOULD be exceptional.

Public interfaces SHOULD expose only what consumers need, keeping implementation details private.

#### Type safety

The TypeScript `any` type MUST NOT appear in repository code.

#### Behaviour documentation

Functions and interfaces MUST have JSDoc documenting their behaviour. Where relevant, documentation MUST explain inputs, results, side effects, and failures rather than narrating implementation.

Comments MUST NOT substitute for readable code. Code SHOULD be self-evident, and supporting comments SHOULD be added only where clarification is needed.

#### JSX and separation of concerns

JSX presentation and business logic MUST remain separate. JSX MUST NOT contain overly complex ternary expressions, inline array mapping (`Array.map`), or similarly complex processing.

Such logic MUST be extracted into a separate component, a React hook, or simple logic above the JSX segment, according to its responsibility.

#### Error handling and promises

Error handling MUST be explicit. Functions that can throw MUST document the circumstances using JSDoc `@throws` tags. Asynchronous functions MUST also document their rejection behaviour. Functions that cannot throw or reject do not require an artificial `@throws` tag.

Promise rejections MUST be explicitly handled or propagated to the caller through a documented failure contract. The `void` operator MAY be used to intentionally discard a promise's result only when that promise is guaranteed not to reject. It MUST NOT be used as a substitute for rejection handling.

#### Linting and formatting

An ESLint and Prettier toolchain MUST be provided through the `@whiteeclipse/toolchain` package. ESLint rules MUST be derived from this RFC.

ESLint and Prettier checks MUST run on every push through GitHub Actions. Both checks MUST pass for the latest pull request revision before merge.

## Consequences and drawbacks

The shared stack and conventions make code easier to understand, review, and reuse. They also limit technology choices and require ongoing tooling, documentation, and test maintenance. Automated checks support human review but cannot establish readability or correctness on their own.

Testing increases confidence at the cost of CI time and maintenance. Exploratory work can proceed without tests, but coverage needs reassessment before production. Proportionate testing does not cover every possible failure.

Static hosting simplifies application delivery, but content updates require a new build and deployment. Exported packages remain independent of Hypatia's hosting and bundling choices.

Documentation builds depend on other repositories' `origin/main` branches, so their output can change without a Hypatia change. Directory moves can affect navigation and URLs, and assets and links need processing. All imported content except `AGENTS.md` files is published publicly; private repositories and restricted publication are outside this pipeline. Imported Markdown and assets still need safe rendering.

## Alternatives considered

### Server-side rendering at request time

Rendering pages on a server for each request was rejected primarily for cost reasons. It would require a running application service and additional operational maintenance, while providing little benefit for Hypatia's landing pages and documentation, whose content can be generated at build time. Static generation therefore better fits the project's needs and hosting target. This choice does not exclude rendering React components to HTML during the build.

### Other programming languages

Other languages, including Python and Rust, were considered but rejected early in favour of TypeScript, which aligns with the project owner's existing expertise. This choice prioritizes familiarity and the ability to develop and maintain the repository effectively.

### Dedicated documentation generators

A dedicated documentation generator was considered, but the remark/rehype pipeline was preferred to simplify the publication process and reuse the same Markdown documentation standard across repositories, regardless of their implementation language.

### Node.js with a separate package manager

Node.js with npm or pnpm was considered as an alternative to Bun. Bun was favoured for its speed and built-in tooling.

### Styled component libraries

A styled component library was considered, but Radix Primitives was preferred to provide the accessibility behaviour required by the project while leaving styling and theming to Core UI. This separation allows the interface to be specialized to White Eclipse's visual identity.

## Delivery and validation

The whole repository MUST comply with this RFC before acceptance. Work implementing the proposal before acceptance remains exploratory pre-production work under the [RFC standard](../../standards/categories/rfcs.md#when-an-rfc-is-required).

Adoption includes the required shared toolchain and the documentation build and deployment pipeline. Affected documentation MUST be updated to describe the resulting implementation. The proposed rendering security amendment requires its own project-owner approval; acceptance of this RFC MUST NOT imply approval of that amendment.

Data migration is not applicable to the static documentation website.

Before acceptance, all repository scripts MUST be run successfully in their intended modes, including type checks, linting, formatting checks, tests, and production builds. Validation results MUST be recorded for the repository revision submitted for acceptance.

The documentation website MUST be deployed and publicly accessible at [whiteeclipse.dev](https://whiteeclipse.dev) before acceptance. Validation MUST confirm that the deployed documentation, navigation, and supporting assets work as specified. Valid source links to published documents and supporting assets within the imported `docs` trees MUST resolve after rewriting, while relative links pointing outside `docs` MUST retain the unresolved behaviour specified above.

Validation MUST check the emitted manifest against the complete output file inventory. Failure checks MUST demonstrate that failed imports, rendering errors, invalid manifests, and interrupted deployments preserve the previously deployed documentation. Validation MUST also cover the rendering security requirements.

These are planned acceptance criteria; this section does not record completed validation or deployment. Passing these checks does not replace explicit owner acceptance.

## Open questions

There are no unresolved questions.

## Decision record

Acceptance is pending.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-19 | Akane SHIMOKA | Initial draft defining the stack, engineering conventions, and documentation publication requirements, including publication triggers, AGENTS.md exclusions, and source-link responsibility. |
