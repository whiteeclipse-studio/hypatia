---
id: model-api-reference
standard_revision: 1
---

# Public API reference model

This model supports the [category standard](../categories/public-documentation.md), the [root documentation standard](../README.md), and [project governance](../GOVERNANCE.md). Those standards define the requirements; this model supplies authoring guidance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

Copy the template to `docs/public/api/subject.md`. Replace its identifier, title, notice, revision placeholders, and guidance with actual content. Keep the required sections in order and explicitly state when a section does not apply. Adjust links, including the licence link, for the final location. Translations follow the shared mirrored-tree and English-source-reference rules.

Keep revision history in the final table. Examples of paths in this model do not establish applicability or completed verification.

## Copyable template

```markdown
---
id: api-subject
standard_revision: 1
---

# Subject

## Overview

Identify the interface, consumers, boundary, and covered subset.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Applicability

Identify the documented versions, stability, compatibility scope, and any planned or deprecated behaviour.

## Access and setup

Describe connection or loading, authentication, authorization, and required setup; state what does not apply.

## Interface contract

Describe operations, inputs, outputs, defaults, constraints, side effects, and relevant pagination, ordering, retry, idempotency, or concurrency behaviour. Link to authoritative contracts.

## Examples

Give representative valid interactions and results, including relevant failures. Identify placeholders and use no live credentials.

## Errors and limits

Describe error conditions, representations, applicable codes and limits, recovery, and relevant migration links.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
