---
id: std-structure
---

# Documentation structure standard

This standard defines how project documentation is organized, including folder locations, filenames, and supporting assets. See the [standards entrypoint](./README.md).

## Rules

### Folder layout

The documentation directory MUST be named `docs` and reside at the project root.

The `docs` directory MUST NOT contain immediate subfolders other than `public`, `internal`, `standards`, `translations`, and `assets`, unless another standard explicitly permits them.

Publication and access requirements for these folders and their contents MUST follow the [publication standard](./PUBLICATION.md).

Repository and package `README.md` entrypoints and `AGENTS.md` files MAY reside outside `docs`. Documentation indexes MAY reside alongside the content they introduce.

#### Standards

- Hypatia's documentation standards MUST apply unless overridden by a project standard at the corresponding path under `docs/standards`.
- Project standards at matching paths MUST override the corresponding Hypatia standards; no additional override declaration is required.
- The project's `docs/README.md` MUST reference the shared standards using their canonical URLs.
- Externally maintained standards and models MAY be referenced without keeping local copies.

Projects maintaining local standards, extensions, or models MUST place them in `docs/standards` using the following locations and filename styles:

| Location                     | Contents                     | Filename style |
| ---------------------------- | ---------------------------- | -------------- |
| `docs/standards/`            | Shared standards             | Uppercase      |
| `docs/standards/categories/` | Category-specific standards  | `kebab-case`   |
| `docs/standards/models/`     | Optional authoring templates | `kebab-case`   |

These filename styles exclude folder entrypoints, which follow the [authoring standard](./AUTHORING.md#metadata).

Each category standard MUST define its document locations within this hierarchy, relative to the project root.

Models provide optional authoring guidance. Requirements MUST be defined in standards rather than only in models.

#### Public

Public source documentation MUST reside in `docs/public` and be understandable without access to internal documentation.

#### Internal

Internal source documentation MUST reside in `docs/internal`, except for standards and reusable models.

These folders describe the intended audience, regardless of repository visibility.

#### Translations

Translations MUST reside in `docs/translations` and follow the [translation standard](./TRANSLATIONS.md).

### Supporting assets

- Supporting assets MUST reside in an `assets` folder alongside the document they belong to.
- Documents directly under `docs` MAY use `docs/assets`.
- Asset filenames MUST begin with the owning document's `id`, followed by a hyphen and a descriptive name.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
