---
id: model-ui-design
standard_revision: 1
---

# UI design proposal model

This model supports the [category standard](../categories/ui-designs.md), the [root documentation standard](../README.md), and [project governance](../GOVERNANCE.md). Those standards define the requirements; this model supplies authoring guidance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

Create a documentation set under `docs/internal/designs/design-subject/` with the four templates below. Replace identifiers, titles, notices, revision placeholders, and guidance with actual content. Keep each entrypoint's required sections in order and explicitly state when content does not apply. Every authored file needs its own project-unique ID, notice, and final revision table. Translations follow the shared mirrored-tree and English-source-reference rules.

The main README alone holds `status: draft` and the pending decision record for the full proposal. Supporting files do not repeat this lifecycle. The examples do not establish acceptance, implementation, or completed verification. Approval later identifies the reviewed document IDs and revisions and a fixed repository snapshot covering the documents and assets.

A simple layout is:

```text
docs/internal/designs/design-subject/
├── README.md
├── inspirations.md
├── mockups.md
├── implementation-rules.md
└── assets/                       # Assets named after their owning document's ID
```

Every part can grow into multiple files. For inspirations, mockups, or implementation rules, replace the single file with a directory of the same stem containing `README.md` and linked subject pages. For example, `mockups/README.md` can index `mockups/navigation.md` and `mockups/settings.md`. Keep the existing document ID when moving its entrypoint; give new pages their own IDs. Adjust incoming links, cross-document links, and asset paths. A moved entrypoint one level deeper needs `../../../../../LICENCE` and its assets alongside it under `assets/`.

The main README can likewise summarize and link to supporting context, journey, or validation pages, while retaining the central status, documentation index, open questions, and decision record. Each page links back to its part's entrypoint or the main README. The entrypoint and its linked pages together supply the part's required content; subject pages can use headings suited to their topic.

The inspirations template can serve as a moodboard. The mockups template requires actual visual samples and explanatory text; an external design link alone is insufficient. Use implementation rules appropriate to the target platform, without assuming React, TypeScript, CSS, or a browser. If an inspirations, mockups, or supporting page uses uppercase requirement keywords, add the declaration from the main README template after its copyright notice.

## Main README

Copy to `docs/internal/designs/design-subject/README.md`.

```markdown
---
id: design-subject
standard_revision: 1
status: draft
---

# Subject

## Summary

Describe the proposed interface change and intended user benefit.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this document follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Context and scope

Describe the current experience, intended users, constraints, affected surfaces, and exclusions. Link to related RFCs and existing foundations.

## Documentation index

- [Inspirations](inspirations.md): source references, rationale, and intended direction.
- [Mockups](mockups.md): visual samples, interactions, and adaptations.
- [Implementation rules](implementation-rules.md): reusable elements, concrete values, behaviour, and verification.

Adjust these links when a part uses a directory entrypoint. Link to additional detailed pages where needed.

## User journeys

Describe entry points, user roles, actions, navigation, outcomes, and recovery paths. Link to detailed flows and mockup samples rather than duplicating them.

## Consequences and alternatives

Describe usability and implementation tradeoffs, costs, reuse, deviations from existing foundations, and credible alternatives.

## Validation

Define observable review criteria for the whole set, including relevant states and accessibility. Separate planned checks, completed checks, and prototype observations.

## Open questions

List unresolved choices and resolution conditions, or state that none remain. Resolve material questions before acceptance; record boundaries and conditions for deferred details.

## Decision record

Acceptance is pending. This proposal is a draft and does not establish an accepted or implemented design.

When the responsible human owners make a decision, record the approving individuals, date, approved README revision, approval reference, and conditions. Identify all reviewed document IDs and revisions and a canonical reference to a fixed repository snapshot covering the documents and assets. Preserve earlier decision records; later edits do not inherit approval automatically.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Inspirations

Copy to `docs/internal/designs/design-subject/inspirations.md`.

```markdown
---
id: design-subject-inspirations
---

# Subject — Inspirations

Part of the [design proposal](README.md).

## Overview

Describe the intended mood, identity, experience, and aspects explored. Link to detailed inspiration pages if this part is split.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../LICENCE) file for the complete licence text.

## Sources

Identify inspiration sources, creators or publishers where known, and references. Explain what each source contributes. Add representative material where useful and identify attribution or reuse restrictions where applicable.

## Design direction

Explain intended composition, typography, palette, imagery, material, or motion principles and their rationale. Link to the relevant [mockups](mockups.md) and [implementation rules](implementation-rules.md).

## Boundaries

Describe what should not be carried over, deliberate deviations, and illustrative or exploratory elements. Link to concrete requirements in the implementation rules rather than maintaining a separate specification here.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Mockups

Copy to `docs/internal/designs/design-subject/mockups.md`.

```markdown
---
id: design-subject-mockups
---

# Subject — Mockups

Part of the [design proposal](README.md).

## Overview

Identify the journeys, surfaces, and design aspects illustrated. Link to the [inspirations](inspirations.md) and [implementation rules](implementation-rules.md).

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../LICENCE) file for the complete licence text.

## Samples

Insert reviewable visual samples as repository assets, with descriptive text and captions. For example, a sample owned by this document could reside at `assets/design-subject-mockups-main.png`. Identify each surface, state, display or device context, theme where relevant, and any illustrative content or approximated values. Explain the layout and hierarchy. Replace this guidance with actual samples or links to sample pages.

## Interactions and states

Describe actions, transitions, outcomes, and recovery. Cover relevant default, loading, empty, success, error, disabled, and permission states; state which are not depicted or do not apply. Storyboards may illustrate transitions, with provisional motion clearly identified.

## Adaptations

Show or describe supported screen, input, theme, language, and long-content variations. Present comparable visual variants together where useful. Identify omissions and limitations without implying that proposed samples prove delivered behaviour.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Implementation rules

Copy to `docs/internal/designs/design-subject/implementation-rules.md`.

```markdown
---
id: design-subject-implementation-rules
---

# Subject — Implementation rules

Part of the [design proposal](README.md).

## Overview

Identify the implementation scope, established target platforms or technologies, existing foundations, and constraints. State unresolved technology choices without selecting a stack implicitly.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this document follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Building blocks

Catalogue reusable elements and their responsibilities, composition, variants, states, inputs, outputs, and reuse of existing elements. Link to corresponding samples and detailed rules. Use terminology appropriate to the project: components, native views, widgets, controls, templates, or other elements.

## Visual rules

Specify authoritative typography, colours, spacing, sizing, layout, borders, depth, imagery, and motion values or constraints where relevant. Give units, meaningful names, relationships, and state, theme, or adaptation rules. CSS values can serve web projects; use native style resources, platform measures, or other appropriate forms elsewhere. Link to existing foundations instead of copying them. Distinguish required values from illustrative examples.

## Interaction and accessibility

Specify behaviour, state transitions, feedback, navigation, focus, supported inputs, semantics, labels, contrast, reduced motion, and relevant localization or content constraints. Describe platform-specific adaptations and explain concerns that do not apply.

## Verification

Define observable compliance checks and their prerequisites, linked to the [mockups](mockups.md) and [proposal validation](README.md#validation). Separate planned methods from executed checks and evidence. Track unresolved values or behaviours in the [main open questions](README.md#open-questions).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
