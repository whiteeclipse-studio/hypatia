---
id: std-package-documentation
standard_revision: 1
---

# Published package documentation standard
## Purpose and scope

Package documentation explains how consumers install, configure, and use a published package. It covers public and restricted packages, their consumer entrypoints, and detailed documentation delivered with or alongside a release. Documentation forms a set of linked documents; the README introduces that set rather than containing every reference.

These documents MUST follow the [root documentation standard](../README.md) and the [project governance standard](../GOVERNANCE.md). Shared metadata, English sources, translations, supporting assets, copyright notices, revision histories, ownership, and publication rules apply without being redefined here.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Location and identification

Canonical detailed package documentation MUST reside under `docs/internal/packages/<package-key>`. `<package-key>` MUST be a stable lowercase kebab-case directory name unique to the package within the project; the body MUST identify the actual published name, including any registry scope. A single documentation set MAY use this directory directly, with `README.md` as its entrypoint. Separate version ranges MAY use the versioned layout described below.

A package-local `README.md` MAY reside alongside the package code as an authored or generated consumer entrypoint. An authored entrypoint MUST follow the shared metadata, notice, and revision rules. It MAY summarize installation and usage, but MUST link to the authoritative detailed documentation rather than maintain an independent copy of it. Each authored document MUST have its own project-unique `id`; no category-specific fields are required beyond the shared entry-file metadata.

Generated copies MAY be included in a package archive or documentation website. They MUST be derived from the canonical sources and MUST NOT be maintained independently. Their links, assets, and licence references MUST resolve in the distributed or published context.

## Version coverage

Documentation SHOULD state which package versions it covers. Separate documentation sets MAY reside at `docs/internal/packages/<package-key>/<version>`, each with its own `README.md`, references, guides, and supporting assets. `<version>` MUST be the full package version of the first release covered by that set, following the [package versioning rules](../GOVERNANCE.md#reusable-packages). It is a coverage boundary, not a document revision number or a major-version label.

Each versioned README MUST state the first covered version and either the last covered version, inclusive, or that the range is open-ended. A range MAY span multiple major versions when the documentation remains accurate throughout. An open-ended range identifies the currently maintained documentation; it does not guarantee compatibility with future releases.

For example, documentation for `@whiteeclipse/log` could use:

| Documentation directory | Covered package versions |
| --- | --- |
| `docs/internal/packages/log/1.0.0/` | `1.0.0` through `2.3.4`, inclusive. |
| `docs/internal/packages/log/3.0.0/` | `3.0.0` onward, an open-ended range. |

An optional `docs/internal/packages/<package-key>/README.md` MAY index the available ranges and link to their entrypoints. Separate authored sets MUST retain project-unique document identifiers, including when their content starts from an existing set. The set's directory path and main README MUST be the sole authoritative representation of its version coverage. All other documents inherit that coverage and MUST NOT restate it in metadata or content. Migration source and target versions describe the migration itself rather than the documentation set's coverage.

When extending a maintained range, authors MUST verify that the documentation remains accurate for all covered releases. When changes require a separate set, earlier documentation MUST remain available for the versions it covers, with its coverage made explicit. Links published for a specific package release MUST lead to a set covering that release rather than silently redirecting consumers to incompatible current documentation.

## Audience and access

Package documentation is maintained as internal project documentation, even when published for public package consumers. Publication and access MUST follow the [package access policy](../GOVERNANCE.md#documentation-publication-and-access): documentation for public packages must be publicly accessible, and documentation for restricted packages must have matching restrictions. This applies to entrypoints, detailed documentation, translations, and supporting assets.

A consumer MUST NOT need access to the source repository to use the documentation made available with the package. Detailed documentation MAY be delivered inside the package, on a documentation website, or through another location accessible to the package audience.

## Documentation organization

Each package documentation set MUST be organized as a discoverable set of documents, with its own canonical `README.md` as its entrypoint. The README is not required to contain the complete reference. Detailed material SHOULD be linked from the README instead of copied into it.

The set SHOULD grow with the package's scope. Locations below are relative to that set's root, including its `<version>` directory when used:

| Document                              | Default location within the package documentation directory | Use                                                                                                           |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| README                                | `README.md`                                                 | Required orientation, quick start, and documentation index.                                                   |
| Public interface reference            | `interfaces.md` or `interfaces/README.md`                   | SHOULD be separate from the README; MAY be split into linked reference pages.                                 |
| Configuration and behaviour reference | `configuration.md` or `configuration/README.md`             | SHOULD be separate when settings or behaviour need an extended reference; MAY be split into linked pages.     |
| Migration guides                      | `migrations/<subject>.md`                                   | Provide migration instructions when consumers must adapt; nontrivial migrations SHOULD have a separate guide. |
| Task guides and examples              | `guides/<task>.md`                                          | MAY explain longer workflows, integrations, or worked examples.                                               |

Supported interfaces and applicable configuration, compatibility, and migration information MUST be documented, regardless of how files are divided. Small packages MAY keep concise material inline when it remains complete and easy to navigate. The documentation index MUST identify that material, including inline sections. Documents for concerns that do not apply MAY be omitted.

Files other than `README.md` MUST use descriptive lowercase kebab-case stems. Subdirectories MAY group references by public entrypoint, module, namespace, interface, or task. A split reference MUST have an entrypoint that explains its organization and links to its pages. Each page MUST provide a route back to its reference entrypoint or the package README.

Every authored file MUST have its own shared metadata, copyright notice, and final revision history. Migration guides MUST identify their source and target versions directly. Copies generated for publication remain derived outputs rather than additional authored sources.

## Document types

The following sections define the shape of each document type. These are separate document profiles, not successive sections that must all appear in the README. Authored entrypoints MUST include the listed sections in order; a section with no applicable content MUST say so explicitly. When a concise reference is kept inline, its content MAY be expressed as subsections without duplicating the containing file's metadata, notice, or revision history. Supporting reference pages MAY use subject-specific headings while retaining the shared requirements and navigation described above.

### README

Default location: `README.md`.

| Section                           | Required content                                                                                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**                      | Give the exact published package name, purpose, intended consumers, and main responsibilities.                                                                                                                                |
| **Copyright and licence**         | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link.                                       |
| **Applicability**                 | Identify the documented version or maintained range under [Version coverage](#version-coverage), supported runtimes, required dependencies, and concise compatibility or stability expectations. Link to migration guidance when needed.                                  |
| **Installation and quick start**  | Describe the package source, installation, required access, setup, and a minimal working example. Identify placeholders and environment-specific choices.                                                                     |
| **Documentation index**           | Link to the public interface reference, configuration reference, migration guides, and task guides that exist. Explain their scope so consumers can find the right document. Inline material MAY be linked by heading anchor. |
| **Support and related resources** | Link to accessible examples, release information, and support routes relevant to consumers.                                                                                                                                   |
| **Revisions**                     | End with the numbered history required by the [shared revision rules](../README.md#revision-history).                                                                                                                         |

The canonical README MUST orient consumers and help them find the documentation set. It SHOULD keep its quick start focused and link to longer installation procedures or examples when needed.

#### Package-local entrypoint

An authored package-local README MAY use a shorter shape: **Overview**, **Copyright and licence**, **Installation and quick start**, **Documentation index**, and **Revisions**. It MUST identify the package and link to the main README for the documentation set covering the published package. Its documentation index MUST lead to a published form of the documentation accessible to the package's audience. It MUST NOT require consumers to navigate a private source repository.

A generated package-local README MAY reproduce the canonical entrypoint, with links and licence references adapted to the delivered layout. Independent copies of detailed references MUST NOT be maintained.

### Public interface references

Default location: `interfaces.md`.

| Section                           | Required content                                                                                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**               | Identify the covered public entrypoints, modules, namespaces, or other interface groups, and explain how the reference is organized.                                                    |
| **Copyright and licence**  | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link. |
| **Interface reference**    | Describe supported exports, types, commands, or other interfaces using the entry structure below. Distinguish supported public contracts from implementation internals.                 |
| **Examples**               | Provide representative use of the documented interfaces, with expected results and relevant failures. Identify setup requirements and placeholders.                                     |
| **Constraints and errors** | Describe cross-cutting constraints, error behaviour, side effects, and recovery expectations, linking to configuration or migration guidance where relevant.                            |
| **Revisions**              | End with the numbered history required by the [shared revision rules](../README.md#revision-history).                                                                                   |

Public interfaces SHOULD be documented separately from the README. A single `interfaces.md` can cover a small interface surface. Larger references MAY use `interfaces/README.md` as an index and separate pages by public entrypoint, module, namespace, or interface. Each supported interface SHOULD have a discoverable heading anchor or dedicated page.

#### Interface entries

Each entry MUST describe, where applicable:

- The supported name and how to import, invoke, or reach it.
- Its purpose, signature or structure, inputs, required and optional values, defaults, and constraints.
- Results, return types, emitted events, or other observable outputs.
- Side effects, asynchronous behaviour, resource ownership, and cleanup obligations.
- Error conditions, relevant limits, and consumer recovery expectations.
- Representative usage and any deprecated or migration-related behaviour.

The structure MAY adapt to functions, classes, types, commands, events, or other exposed interfaces. Shared behaviour MAY be defined once and linked from relevant entries. Generated reference material MAY supplement the authored reference when its authoritative input is identified. It MUST follow the coverage defined by the set's main README.

### Configuration and behaviour references

Default location: `configuration.md`.

| Section                           | Required content                                                                                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | Describe the configurable behaviour, lifecycle, or operating modes covered by this reference. |
| **Copyright and licence** | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link. |
| **Prerequisites** | Identify relevant environments and required setup or dependencies. |
| **Configuration reference** | For each setting, describe its name, type, allowed values, default, purpose, and effect. Explain configuration sources, precedence, interactions, and relevant examples. |
| **Runtime behaviour** | Describe relevant initialization, resource lifecycle, cleanup, concurrency, limits, side effects, and recovery behaviour. State when a concern does not apply. |
| **Troubleshooting** | Explain relevant symptoms, configuration mistakes, diagnostics, and recovery or support routes. |
| **Revisions** | End with the numbered history required by the [shared revision rules](../README.md#revision-history). |

Configuration and runtime behaviour MUST be described when they affect package use. An extended catalogue SHOULD live in a separate file or reference tree; a few straightforward settings MAY remain beside the quick start or in the public interface reference, with a link from the documentation index. Configuration details MUST agree with the public interface reference and the documented release.

### Migration guides

Default location: `migrations/<subject>.md`.

| Section                           | Required content                                                                                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | Explain the migration and when consumers need to follow it. |
| **Copyright and licence** | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link. |
| **Versions and prerequisites** | Identify source and target versions, supported migration paths, runtime or dependency requirements, and required access or preparation. |
| **Breaking changes** | Describe affected interfaces, defaults, configuration, or behaviour, with concrete before-and-after examples where useful. |
| **Migration steps** | Provide ordered changes consumers need to make. Identify data or configuration transformations and dependencies between steps where relevant. |
| **Validation and recovery** | Describe observable checks for successful migration and recovery or rollback where possible. State irreversible changes and recovery limitations explicitly. |
| **Revisions** | End with the numbered history required by the [shared revision rules](../README.md#revision-history). |

Migration instructions MUST be provided when consumers need to change their usage, configuration, or data. Nontrivial migrations SHOULD have a separate guide; a brief compatible transition MAY be covered by a clearly linked note. Each guide SHOULD cover a bounded migration path. Compatibility expectations that apply generally belong in README applicability or a linked compatibility reference, rather than being repeated in every migration guide.

### Task guides and examples

Default location: `guides/<task>.md`.

| Section                           | Required content                                                                                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | Identify the consumer task and intended outcome. |
| **Copyright and licence** | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link. |
| **Prerequisites** | Identify required setup, permissions, dependencies, and knowledge. |
| **Instructions** | Provide complete ordered actions or a worked example, with explanations of inputs, choices, and consequential operations. |
| **Expected results** | Describe the observable output or resulting state and how consumers verify success. |
| **Troubleshooting** | Describe likely failures and practical recovery or support routes; state when no task-specific troubleshooting applies. |
| **Revisions** | End with the numbered history required by the [shared revision rules](../README.md#revision-history). |

Separate task guides MAY explain workflows that would overwhelm the README or obscure the interface reference. Executable example projects MAY supplement a guide; the Markdown MUST explain their purpose, setup, expected results, and relation to the documented release. Interface contracts remain authoritative in the interface reference rather than being independently redefined by examples.

## Release validation and maintenance

Package release versions MUST follow the [governance versioning rules](../GOVERNANCE.md#software-versioning), including the pre-release requirement for unaccepted RFCs. The directory path and main README MUST describe coverage of the actual package artifact; an application's calendar label MUST NOT substitute for a different package version.

Before publication, the package's documentation review MUST cover the package-local entrypoint, documentation index, linked references and guides, relevant translations, and supporting assets included in or linked from the release. Review MUST confirm that the main README covers the package release, as well as the supported public interface, installation and usage examples, resolved links and licence references, and access matching the package's audience.

Generated documentation MUST be built from the sources corresponding to the package release. Updates to maintained ranges MUST follow [Version coverage](#version-coverage); version-specific documentation MUST NOT silently change to describe releases outside its stated scope. Ongoing updates and review follow governance; proposed interface changes requiring an RFC remain subject to the RFC standard.

## Reusable model

The [package documentation model](../models/package-documentation.md) provides separate templates for the canonical README, public interface reference, configuration reference, migration guide, and task guide. Select the documents appropriate to the package; a package-local summary can be derived without becoming a second authoritative reference.

## Revisions

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
