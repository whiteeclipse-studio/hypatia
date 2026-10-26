---
id: std-package-documentation
standard_revision: 1
---

# Package documentation standard

This standard defines documentation that helps consumers understand and use a package. See the [standards entrypoint](../README.md).

## Rules

### Location and scope

A package is a unit of software maintained for distribution or consumption as a dependency, such as a library, SDK, or reusable tool. It does not need to be published to a public registry.

- Packages MUST reside outside the `docs` folder.
- Each package MUST have a `README.md` alongside its code.
- `<package-key>` MUST be a stable, unique lowercase `kebab-case` identifier.
- Additional package documentation MAY reside in `docs/internal/packages/<package-key>`, with a `README.md` entrypoint.
- When additional documentation exists, the package-local README MUST link to its canonical URL.
- Additional documentation MUST state its covered version or range in its README. Supporting pages inherit that coverage and MUST NOT independently redeclare it; they MAY mention versions in examples, migration instructions, or other relevant explanations.
- Separate ranges MAY use `docs/internal/packages/<package-key>/<version>/`, where `<version>` is the first covered version. Each range README MUST state an inclusive end or identify the range as currently active, meaning its upper bound remains open until a closing version is recorded.
- Earlier documentation MUST remain available while consumers need it. Release links MUST point to documentation covering that release.
- Package documentation, including any additional documentation, MUST be accessible to everyone who has access to the package itself.

### Package README content

- The README MUST identify the package and explain its purpose.
- The README MUST provide installation or setup instructions and a minimal usage example, where applicable.
- The README SHOULD identify relevant compatibility requirements, such as supported runtimes or peer dependencies.

### Additional documentation

Additional documentation provides detail that would make the package README too long, such as interface references, configuration, longer examples, or migration instructions.

- Its README MUST identify the package and index any supporting files.
- Content SHOULD focus on what consumers need to use the package correctly.
- Files and sections MAY be organized according to the package's needs.
- Migration instructions MUST identify the source and target versions, required consumer changes, and how to check the result. Recovery guidance MUST be included for changes affecting stored data or that cannot easily be undone.

## Reusable model

The [package documentation model](../models/package-documentation.md) provides optional starting points.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
