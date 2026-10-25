---
id: model-package-documentation
standard_revision: 1
---

# Package documentation model

This model provides starting points for proposed revision 2 of the [package documentation standard](../categories/package-documentation.md). It does not establish adoption or add requirements.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Using this model

Start with the README and add only the references the package needs. Keep explanations short and focused on using the package. Replace placeholders, remove unused links, and adjust paths to the final location. Supporting pages inherit version coverage and the standard pin from the README.

The README template targets proposed revision 2. Use it only for work explicitly targeting that proposal until the revision is adopted. Existing revision-1 documents retain their pins; the [earlier model](https://github.com/whiteeclipse-studio/hypatia/blob/5d2c7989adbfdd848791614e730348a8b16607d7/docs/standards/models/package-documentation.md) remains available for them.

Each template needs its own unique ID, copyright notice, and revision history. Licence URL, year, holder, author, date, and package details below are placeholders. Do not copy another person's authorship.

## README

Copy to `docs/internal/packages/<package-key>/README.md`. For separate version ranges, add a `<version>` directory as described by the standard.

```markdown
---
id: package-subject
standard_revision: 2
---

# Package name

## Overview

What the package does and who it is for.

## Copyright and licence

Copyright © YYYY Copyright Holder.

Released under Licence Name. See the root [LICENCE](https://example.com/project/LICENCE).

## Applicability

Covered package versions and required runtimes or dependencies.

## Installation and quick start

Installation, essential setup, and a minimal working example.

## Documentation index

- [Public interfaces](interfaces.md): exports and usage examples.
- [Configuration](configuration.md): defaults, behaviour, and troubleshooting.

## Support and related resources

Useful source, support, or release links.

## Revisions

| Revision | Date       | Author      | Description      |
| -------- | ---------- | ----------- | ---------------- |
| 1        | YYYY-MM-DD | Author Name | Initial version. |
```

For a package-local README, use the same basic shape, omit detailed reference material, and link to the published canonical documentation. Applicability and support may be left to that documentation.

## Public interface reference

Copy to `interfaces.md` beside the canonical README.

```markdown
---
id: package-subject-interfaces
---

# Package public interfaces

## Overview

The public interfaces covered here. Return to the [package README](README.md).

## Copyright and licence

Copyright © YYYY Copyright Holder.

Released under Licence Name. See the root [LICENCE](https://example.com/project/LICENCE).

## Interface reference

### Export name

How to import or invoke it, what it does, and the inputs and results consumers need to understand.

## Examples

A short working example with its expected result. Examples can instead sit beside the relevant interface.

## Revisions

| Revision | Date       | Author      | Description      |
| -------- | ---------- | ----------- | ---------------- |
| 1        | YYYY-MM-DD | Author Name | Initial version. |
```

## Configuration reference

Copy to `configuration.md` beside the canonical README.

```markdown
---
id: package-subject-configuration
---

# Package configuration

## Overview

The settings covered here. Return to the [package README](README.md).

## Copyright and licence

Copyright © YYYY Copyright Holder.

Released under Licence Name. See the root [LICENCE](https://example.com/project/LICENCE).

## Configuration reference

Useful settings, defaults, and their purpose. Group related rules and explain why they are enabled. Link to upstream documentation for general option details.

## Troubleshooting

Realistic problems and short, actionable fixes. Omit this section if it adds no useful information.

## Revisions

| Revision | Date       | Author      | Description      |
| -------- | ---------- | ----------- | ---------------- |
| 1        | YYYY-MM-DD | Author Name | Initial version. |
```

## Migration and task guides

Add `migrations/<subject>.md` when consumers need upgrade instructions, or `guides/<task>.md` for a longer workflow. Use the shared document metadata, notice, and revision history. Link back to the package README, adjusting the relative path for the guide's location.

A migration guide identifies source and target versions, the required changes, and checks for success. Include recovery instructions when changes affect data or cannot be easily undone.

A task guide states the goal, necessary setup, steps, and expected result. Use headings that help readers complete the task rather than adding empty sections.

## Revisions

| Revision | Date       | Author        | Description                                                               |
| -------- | ---------- | ------------- | ------------------------------------------------------------------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft                                                             |
| 2        | 2026-10-25 | Codex         | Align templates with the proposed concise package documentation standard. |
