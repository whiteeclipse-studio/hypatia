---
id: rfc-0001
standard_revision: 1
status: draft
---

# rfc-0001 — Repository structure
## Summary

This RFC aims to define the broad structure of the Hypatia repository and the responsibilities of its main directories.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this document follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Context and motivation

Hypatia provides White Eclipse's landing page and documentation website. The repository MUST have a well-ordered structure with clear directory responsibilities to support the development and maintenance of both sites.

The structure is intended to support a stack such as Vite and Bun for static websites, including a documentation website that imports public and internal documentation from other White Eclipse projects, with access control where required. Stack selection and the documentation import and build mechanisms are reserved for a future RFC.

## Scope

This RFC covers the `apps`, `docs`, and `packages` directories of the Hypatia repository and their responsibilities. Applications, packages, feature design and detailed implementation choices within applications and packages are outside its scope.

## Proposed design

### `docs`

`docs` MUST contain Hypatia's documentation. Its organization and documentation defaults MUST follow the [documentation standards entrypoint](../../standards/README.md) and its applicable standards.

Hypatia MUST follow the standards it defines for other projects. Shared standards reside in `docs/standards`, and reusable document models reside in `docs/standards/models`. These standards and models MAY be adopted or adapted by projects outside White Eclipse.

The [documentation structure rules](../../standards/README.md#project-documentation-structure) define the placement and intended audiences of public documentation, internal documentation, standards, and reusable models.

### `packages`

`packages` MUST organize packages by responsibility using the following categories:

| Directory | Responsibility |
| --- | --- |
| `packages/platform` | Shared application capabilities and visual foundations |
| `packages/adapters` | Interoperability and translation for external systems, SDKs, and formats |
| `packages/contracts` | Explicit representations exchanged across defined boundaries |
| `packages/libraries` | Focused reusable building blocks, such as configuration, logging, and development tooling |

Each package MUST have a clear responsibility and declared public exports. Dependencies between packages MUST use those exports and MUST NOT form cycles. Packages MUST NOT depend on `apps`.

### `apps`

Executable entrypoints MUST reside in `apps`. An entrypoint is the code through which an application is started: it loads the application's configuration, assembles the required packages, and starts or mounts the interfaces they expose.

## Consequences and drawbacks

This structure makes code and documentation easier to locate and supports reuse through explicit package boundaries. It adds organizational and review overhead to a small repository. Some capabilities may fit more than one category, particularly platform and libraries, so placement requires judgment about their responsibilities.

Moving existing files may require updates to imports, build configuration, and tooling. Directory organization alone does not change runtime behaviour or public contracts.

Separating public and internal documentation into directories does not itself provide access control. Publication of internal documentation and its supporting assets MUST respect the source project's access restrictions, following the [publication and access rules](../../standards/GOVERNANCE.md#documentation-publication-and-access).

## Alternatives considered

The proposed structure separates application entrypoints from reusable packages and organizes packages by responsibility. The following alternatives were considered:

- **`app` and `lib` instead of `apps` and `packages`:** `app` suggests a structure centred on a single application. `lib` is too vague as a top-level category; libraries are better represented within `packages`, alongside other explicit responsibility categories.
- **Multiple repositories:** Splitting related components across repositories adds maintenance and coordination work and requires frequent context switching.
- **A single monolithic application:** Keeping all components within one application ties them to that application's structure and makes reuse in other projects difficult.
- **`web`, `node`, `dev`, and `lib` categories:** These mix runtime targets and tooling concerns rather than define clear responsibilities. The proposed categories distinguish what code owns, independently of where it runs or how it is built.

## Delivery and validation

The structure is adopted as documentation, applications, and packages are added or reorganized. Review MUST confirm that their locations and responsibilities follow this RFC and the applicable documentation standards.

When existing code is moved, imports and build configuration MUST be updated and affected builds checked. Package public exports and dependency directions MUST be reviewed where packages exist.

Data migration, production rollout, and runtime recovery procedures are not applicable to this structural decision.

## Open questions

There are no unresolved questions about the repository structure.

## Decision record

Acceptance is pending. This RFC is a draft and does not authorize production work implementing the proposed decision.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-14 | Akane SHIMOKA | Initial draft |
