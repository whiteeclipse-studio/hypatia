---
id: std-package-documentation
standard_revision: 1
---

# Package documentation standard

## Purpose and scope

Package documentation helps consumers understand, install, and use a package. It MUST follow the [shared documentation standard](../README.md) and [project governance](../GOVERNANCE.md), including their metadata, licence, revision, and publication requirements.

Revision 2 is a proposed replacement for revision 1, pending owner review and registration of its shared-standard dependencies in the standards entrypoint. It proposes retaining revision 1 of `std-documentation` and `std-governance`. Existing documentation pins remain unchanged.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Requirement terminology

Uppercase requirement keywords follow IETF BCP 14, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). They carry those meanings only when written entirely in uppercase.

## Location and organization

Canonical package documentation MUST reside in `docs/internal/packages/<package-key>`, with `README.md` as its entrypoint. The package key MUST be a stable, unique lowercase kebab-case name; the README MUST identify the actual package name, including its scope.

Use only the documents the package needs:

| Document                  | Purpose                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| `README.md`               | Introduce the package, show how to start, and link to further documentation. |
| `interfaces.md`           | Explain public exports and how to use them.                                  |
| `configuration.md`        | Summarize settings, defaults, and their purpose.                             |
| `migrations/<subject>.md` | Explain changes consumers need to make between versions.                     |
| `guides/<task>.md`        | Walk through a longer task when the quick start is insufficient.             |

Small packages MAY keep the reference material in the README. Larger references MAY use subdirectories with their own indexes. Supporting pages MUST link back to the package README or their reference index. Other filenames MUST use descriptive lowercase kebab-case stems.

A package-local README MAY provide a short introduction and quick start. It MUST link to the accessible published documentation rather than duplicate the detailed reference. Generated copies MUST come from the canonical sources and have working links in their delivered location.

## Writing approach

Documentation MUST describe the supported package interface and the information consumers need to use it correctly.

- Explain what a feature does and why a consumer would use it.
- Prefer short explanations, useful examples, and simple tables.
- Summarize groups of rules or settings instead of explaining every internal check.
- Link to upstream documentation for general tool behaviour and detailed option syntax.
- Include errors, limits, side effects, or recovery steps when they affect actual use.
- Omit irrelevant details and sections instead of listing everything the package does not do.

Implementation details SHOULD remain in the source unless they explain a consumer-visible constraint. Documentation SHOULD NOT repeat the same explanation across several files.

## Document content

The following sections define the usual order for each document. **Overview**, **Copyright and licence**, and the final **Revisions** section are REQUIRED on every authored page. Other sections are REQUIRED when their subject applies; they MAY be combined or omitted when doing so keeps the document useful and concise.

### README

| Section                       | Content                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Overview                      | Package name and purpose.                                                            |
| Copyright and licence         | The shared notice and root licence link.                                             |
| Applicability                 | Covered package versions and required runtimes or dependencies.                      |
| Installation and quick start  | Installation, essential setup, and a minimal working example.                        |
| Documentation index           | Links to the references and guides that exist, including inline sections where used. |
| Support and related resources | Relevant source, support, or release links.                                          |
| Revisions                     | Revision history.                                                                    |

A package-local README MAY omit Applicability and Support and related resources when these are covered by its linked canonical README.

### Public interface reference

Use **Overview**, **Copyright and licence**, **Interface reference**, **Examples**, and **Revisions**.

For each supported export or interface, explain its name, how to import or invoke it, and what it does. Include the inputs, outputs, and constraints needed to use it correctly. Examples MAY sit alongside the interface entries rather than in a separate section.

### Configuration reference

Use **Overview**, **Copyright and licence**, **Configuration reference**, **Troubleshooting**, and **Revisions**.

Show useful settings and their defaults. Explain their effect in plain language. For rule collections, summarize the enabled groups and why they exist. General option types, all possible values, merge mechanics, and internal lifecycle details SHOULD be left to upstream documentation unless they are needed to use this package.

Troubleshooting SHOULD cover realistic problems with short, actionable fixes. Prerequisites or runtime behaviour MAY have their own sections when they need explanation; they are not required boilerplate.

### Migration and task guides

Migration guides MUST identify the source and target versions, required consumer changes, and how to check the result. Include recovery guidance for changes that affect stored data or cannot be easily undone.

Task guides MUST state the goal, any necessary setup, the steps, and the expected result. Both kinds of guide SHOULD use examples where they make the instructions clearer.

## Version coverage and publication

The canonical README MUST state the version or range it covers. Supporting pages inherit that coverage and MUST NOT repeat it. Separate ranges MAY use `docs/internal/packages/<package-key>/<version>/`, where `<version>` is the first covered package version. Each range README MUST give an inclusive end or state that the range is open-ended.

Earlier documentation MUST remain available when consumers still need it. Release links MUST lead to documentation covering that release. Package documentation MUST be accessible to the package's audience under governance; consumers MUST NOT need source-repository access to read it.

Before release, review the documentation against the package being delivered: public exports, setup examples, required dependencies, links, and included assets. Record the review outcome as required by governance. This revision does not automatically migrate existing documentation sets; migration follows the [shared pinning rules](../README.md#applicable-standards-and-entry-files).

Revision 1 remains recoverable in [its Git snapshot](https://github.com/whiteeclipse-studio/hypatia/blob/5d2c7989adbfdd848791614e730348a8b16607d7/docs/standards/categories/package-documentation.md).

## Reusable model

The [package documentation model](../models/package-documentation.md) provides optional starting points for this proposed revision. The standard defines requirements; the model does not add any.

## Revisions

| Revision | Date       | Author        | Description                                                                         |
| -------- | ---------- | ------------- | ----------------------------------------------------------------------------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft                                                                       |
