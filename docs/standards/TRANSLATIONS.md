---
id: std-translations
---

# Documentation translation standard

This standard defines how translations are organized and linked to their authoritative English sources. See the [standards entrypoint](./README.md).

## Rules

### Applicability

Category standards apply only to canonical English sources. Translations MUST follow this standard instead, including the shared requirements it references. Source-category filename, identifier, and directory-name rules MUST NOT constrain translated files.

Translations MUST follow the [authoring standard](./AUTHORING.md), with the entrypoint naming exception below, and the [publication standard](./PUBLICATION.md).

### Canonical source

- English MUST be the canonical language of documentation. If a translation differs from its English source, the source MUST take precedence.
- Translations MAY be provided and MUST retain their source's category, audience, and standard revision.
- A translated entry file MUST carry the same `standard_revision` as its English source.

### Paths and filenames

- Translations MUST mirror their English source's path relative to `docs`, within the location defined by the [structure standard](./STRUCTURE.md#translations).
- Translated filenames MUST use `<filename>.<language>.md`, where `<filename>` is the source filename without `.md` and `<language>` identifies the translation's language.
- Translated folder entrypoints MUST use `README.<language>.md`, overriding the [authoring standard's entrypoint naming](./AUTHORING.md#metadata).
- When a source moves, its translations MUST move to preserve the mirrored path.

For example, `docs/public/getting-started.md` translates to `docs/translations/public/getting-started.fr.md` in French.

### Metadata

Translations MUST follow the [base authoring metadata rules](./AUTHORING.md#metadata), including their own unique `id`, distinct from `source_id`.

Every translation MUST include these additional YAML fields:

| Field       | Value                                     |
| ----------- | ----------------------------------------- |
| `source_id` | The English source document's identifier. |

### Links and assets

- Links MUST resolve from the translated file's location.
- Translations SHOULD reuse source assets unless localized assets are needed.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
