---
id: model-user-guide
standard_revision: 1
---

# Public user guide model

This model supports the [category standard](../categories/public-documentation.md), the [root documentation standard](../README.md), and [project governance](../GOVERNANCE.md). Those standards define the requirements; this model supplies authoring guidance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

Copy the template to `docs/public/guides/subject.md`. Replace its identifier, title, notice, revision placeholders, and guidance with actual content. Keep the required sections in order and explicitly state when a section does not apply. Adjust links, including the licence link, for the final location. Translations follow the shared mirrored-tree and English-source-reference rules.

Keep revision history in the final table. Examples of paths in this model do not establish applicability or completed verification.

## Copyable template

```markdown
---
id: guide-subject
standard_revision: 1
---

# Subject

## Overview

Describe the task, intended outcome, and when to use this guide.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Audience and prerequisites

Identify readers, applicable versions, permissions, knowledge, and setup requirements.

## Instructions

Give complete ordered steps, identifying relevant commands, labels, inputs, consequential actions, and choices.

## Expected results

Describe the observable result and how readers verify success.

## Troubleshooting

Describe likely symptoms and practical recovery or support routes, or state that none apply.

## Related information

Link to accessible next steps, public references, or package documentation.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
