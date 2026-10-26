---
id: model-api-reference
standard_revision: 1
---

# API reference model

An optional starting point for API documentation. See the [standards entrypoint](../README.md) and [API documentation standard](../categories/api-documentation.md).

## Using this model

Copy the template to `docs/public/api/<id>.md` or `docs/public/api/<id>/README.md`, matching `<id>` to the document identifier. Replace placeholders and select the adopted standards entrypoint revision.

For HTTP APIs, store the specification in an adjacent `assets` folder, using filenames prefixed with the document identifier. The example uses `assets/api-subject-openapi.yaml`; additional YAML files can be connected through OpenAPI references.

Generate the HTTP API's Documentation section from those assets. The comment below marks where generated content belongs; it does not define a generator directive. For non-HTTP APIs, replace the generated source reference and placeholder with authored Markdown.

Use the folder form whenever companion Markdown files are needed, and index them in the README summary. Adjust links for the final location.

## Copyable template

```markdown
---
id: api-subject
standard_revision: 1
---

# API name

Briefly explain the API's purpose and intended consumers.

<!-- For folder-based references, link to any companion documents here. -->

## Documentation

Generated from the [OpenAPI specification](./assets/api-subject-openapi.yaml).

<!-- Insert generated API reference content here. Do not edit it independently. -->

## Copyright and licence

Copyright © YYYY Copyright Holder.

Released under [Licence Name](https://example.com/LICENCE).

## Revisions

| Revision | Date       | Author       | Description   |
| -------- | ---------- | ------------ | ------------- |
| 1        | YYYY-MM-DD | Human Author | Initial draft |
```

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
