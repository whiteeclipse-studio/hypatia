---
id: model-ui-design
standard_revision: 1
---

# UI design proposal model

An optional starting point for an interface proposal. See the [standards entrypoint](../README.md) and [UI design standard](../categories/ui-designs.md).

## Using this model

Create `docs/internal/designs/design-subject/README.md` and replace the placeholders. Select the adopted standards entrypoint revision and adjust links for the final layout.

This example combines inspirations, design, and implementation rules in one supporting file, `design.md`. These parts can instead be included in the main README or split into linked files. Their headings are suggestions; index any separate files in the main README.

Keep proposal status and the decision record in the main README. Add journeys, catalogues, validation, or open questions where they help explain the design.

## Main README

```markdown
---
id: design-subject
standard_revision: 1
status: draft
---

# Design name

Summarize the proposed interface and intended user benefit.

## Scope

Identify the intended users, affected surfaces, constraints, and exclusions.

## Documentation

- [Design details](./design.md): inspirations, visual samples, interactions, and implementation rules.

## Decision record

Acceptance is pending.

<!-- After an owner decision, record the individuals, date, approval reference, conditions, approved README revision, and reviewed supporting document IDs and revisions. Preserve earlier decisions. -->

## Copyright and licence

Copyright © YYYY Copyright Holder.

Released under [Licence Name](https://example.com/LICENCE).

## Revisions

| Revision | Date       | Author       | Description   |
| -------- | ---------- | ------------ | ------------- |
| 1        | YYYY-MM-DD | Human Author | Initial draft |
```

## Combined supporting document

Copy to `design.md` beside the main README.

```markdown
---
id: design-subject-details
---

# Design details

Part of the [design proposal](./README.md).

## Inspirations

Identify sources, explain the intended direction, and note attribution or reuse restrictions. Distinguish external inspiration from original design material.

## Design

Include reviewable visual samples as supporting assets. Describe relevant interactions, states, and accessibility; identify approximations and missing states.

<!-- Example asset location: assets/design-subject-details-main.png -->

## Implementation rules

Specify the precise values and behaviour needed to implement the design. Link to existing foundations and explain any differences from illustrative samples.

## Review criteria

Define observable criteria for reviewing interactions and accessibility. Distinguish planned checks, completed checks, and exploratory observations.

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
