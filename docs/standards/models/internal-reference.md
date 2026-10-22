---
id: model-internal-reference
standard_revision: 1
---

# Internal reference model

This model supports the [category standard](../categories/internal-reference.md), the [root documentation standard](../README.md), and [project governance](../GOVERNANCE.md). Those standards define the requirements; this model supplies authoring guidance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

Copy the template to `docs/internal/reference/subject.md`. Replace its identifier, title, notice, revision placeholders, and guidance with actual content. Keep the required sections in order and explicitly state when a section does not apply. Adjust links, including the licence link, for the final location. Translations follow the shared mirrored-tree and English-source-reference rules.

Keep revision history in the final table. Examples of paths in this model do not establish applicability or completed verification.

## Copyable template

```markdown
---
id: reference-subject
standard_revision: 1
---

# Subject

## Summary

Identify the technical subject and the questions this reference answers.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Scope and applicability

Identify components, versions, environments, boundaries, exclusions, and any historical applicability.

## Reference

Describe the relevant implemented architecture, responsibilities, interfaces, data flows, configuration, dependencies, or invariants. Distinguish facts from assumptions and proposals.

## Constraints and failure modes

Describe applicable limitations, compatibility, security, data-handling, operational constraints, and failure behaviour. Link to detailed procedures when available.

## Verification and sources

Link to authoritative code, configuration, tests, contracts, and accepted decisions. Explain verification of important claims and distinguish completed checks from planned checks.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
