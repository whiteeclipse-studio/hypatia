---
id: rfc-0001
standard_revision: 1
status: draft
---

# rfc-0001 — Repository structure

This RFC defines Hypatia's top-level repository structure and separates application entrypoints, reusable packages, and project documentation.

## Proposal

Hypatia's landing page and documentation website share a repository organized around three directories: `apps`, `packages`, and `docs`. This proposal defines their responsibilities; technology choices, feature designs, and implementation details are outside its scope.

### Applications

Executable entrypoints MUST reside in `apps`. They load application configuration, assemble packages, and start or mount the interfaces those packages expose.

### Packages

Packages MUST be grouped by responsibility:

| Directory            | Responsibility                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `packages/platform`  | Shared application capabilities and visual foundations                                      |
| `packages/adapters`  | Integration with external systems, SDKs, and formats                                        |
| `packages/contracts` | Representations exchanged across defined boundaries                                         |
| `packages/libraries` | Focused reusable building blocks, including configuration, logging, and development tooling |

Each package MUST have a clear responsibility and declared public exports. Package dependencies MUST use those exports, MUST NOT form cycles, and MUST NOT depend on `apps`.

### Documentation

Documentation organization and requirements are defined by the [shared standards](../../standards/README.md).

### Consequences

This separation makes code easier to locate and reuse, with some organizational overhead. Placement still requires judgment where responsibilities overlap, particularly between platform and libraries. Moving code may require updates to imports, build configuration, and tooling.

## Alternatives considered

- **`app` and `lib`:** less suited to multiple applications and distinct package responsibilities.
- **Separate repositories:** more coordination and maintenance overhead.
- **A monolithic application:** makes reuse harder by tying shared code to one application.
- **Runtime-based package groups:** names such as `web` and `node` describe execution targets rather than responsibilities.

## Delivery and validation

Apply the structure as applications and packages are added or reorganized. Review their locations, responsibilities, public exports, and dependency directions against this proposal.

When code moves, update imports and build configuration and check affected builds. These are planned checks; no execution results are recorded here.

## Decision record

Acceptance is pending.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-14 | Akane SHIMOKA | Initial draft |
