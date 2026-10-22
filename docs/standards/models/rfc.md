---
id: model-rfc
standard_revision: 1
---

# RFC document model

This model provides a starting point for RFCs following the [RFC documentation standard](../categories/rfcs.md) and the [project governance standard](../GOVERNANCE.md). Those standards define the requirements; this model provides authoring guidance and a copyable template.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

Copy the Markdown template below into `docs/internal/rfcs/NNNN-subject.md` in the target project. Replace the placeholders and guidance paragraphs with the proposal's content before submitting it for review. Retain all required sections in their existing order; state explicitly when a section has no applicable content.

- Allocate the next unused RFC number and check the target branch for conflicts before merging. Use the same number in the filename, `id`, and heading, and the same subject in `title` and the heading.
- Complete the authors and creation date. Start with `status: draft` and the pending decision record supplied below.
- Identify the actual copyright holders and applicable licence. The template's `../../../LICENCE` link assumes the RFC is directly in `docs/internal/rfcs`; adjust it if the document's location differs.
- Keep the content proportionate to the decision. Briefly cover relevant impacts and distinguish proposals, prototype results, and verified outcomes.
- Add sequential entries to the `Revisions` table for meaningful changes, starting at 1. Record the approved revision number upon acceptance and preserve its contents in Git history.

Acceptance, rejection, and retraction follow the project's ownership rules. Pre-production prototyping may precede acceptance; production work must wait until the relevant RFC is accepted.

### Conditional metadata

The template omits fields that do not apply to an initial draft. Add these fields when applicable, following the standard:

| Field | Value |
| --- | --- |
| `supersedes` | List of relative links to RFCs fully replaced by this RFC |
| `superseded_by` | List of relative links to accepted replacement RFCs |

Update the decision record alongside the metadata. For acceptance, include the approved revision number, decision makers, date, approval reference, and any conditions. For rejection or retraction, include the reason, decision makers, date, and approval reference. Preserve earlier decisions when recording later ones.

When an unaccepted proposal returns to `draft`, remove `decision_date` and `decision_by` from metadata and record why it was reopened. Preserve its earlier decisions and revisions. Reconsidering a previously accepted and subsequently retracted decision requires a new RFC.

## Copyable template

```markdown
---
id: rfc-NNNN
standard_revision: 1
status: draft
---

# rfc-NNNN — Subject

## Summary

Summarize the proposed decision, its scope, and its intended outcome.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under the Licence Name. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this document follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Context and motivation

Describe the current situation, the concrete problem, relevant constraints, and why a decision is needed. Link to existing decisions or documentation where useful.

## Scope

Identify what this proposal includes and explicitly excludes.

## Proposed design

Describe the intended behaviour, requirements, boundaries, and examples needed to assess the decision. Add subject-specific subsections where useful.

## Consequences and drawbacks

Describe costs, limitations, risks, and maintenance or operational burdens. Briefly assess compatibility and security impacts, stating when they do not apply.

## Alternatives considered

Describe credible alternatives, including retaining the current approach where relevant, and explain why this proposal is preferred.

## Delivery and validation

Describe the adoption approach, affected documentation, and observable criteria for validating the result. Briefly assess data migration, rollout, and recovery, stating when they do not apply. Link to detailed operation runbooks when available.

Distinguish planned checks from checks already performed, and identify any prototype results as exploratory work.

## Open questions

List unresolved decisions and any proposed resolution conditions, or state that none remain.

## Decision record

Acceptance is pending. This RFC is a draft and does not authorize production work implementing the proposed decision.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft |
