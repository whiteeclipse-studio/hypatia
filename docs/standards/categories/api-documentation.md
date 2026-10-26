---
id: std-api-documentation
standard_revision: 1
---

# API documentation standard

This standard defines documentation that explains interfaces and how consumers can use them. See the [standards entrypoint](../README.md).

## Rules

### Location and scope

- API documentation MUST reside at `/docs/public/api/<id>.md` or `/docs/public/api/<id>/README.md`, where `<id>` is the document's identifier and paths are relative to the project root.
- API documentation with companion Markdown files MUST use the folder form, with those files indexed in its `README.md`.

### Root file

- The root file MUST contain, in order, a summary, a **Documentation** section, a **Copyright and licence** notice, and a **Revisions** table.

### Specification and generated reference

- For HTTP APIs, the **Documentation** section MUST be generated from an authoritative OpenAPI specification stored as supporting YAML assets. The specification MAY span multiple files connected through OpenAPI references.
- Generated content MUST identify its source specification and MUST NOT be edited independently.
- Non-HTTP APIs, such as WebSocket interfaces, MAY use authored Markdown in the **Documentation** section instead of OpenAPI-derived content.

## Reusable model

The [API reference model](../models/api-reference.md) provides an optional starting point.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
