---
id: model-rfc
standard_revision: 1
---

# RFC document model

An optional starting point for proposing and recording decisions. See the [standards entrypoint](../README.md) and [RFC standard](../categories/rfcs.md).

## Using this model

Copy the template to `docs/internal/rfcs/NNNN-subject.md`. Allocate the next unused number and match it in the filename, identifier, and title. Replace placeholders, select the adopted standards entrypoint revision, and adjust links.

Keep the required sections in order. Include Delivery and validation for implementation proposals as appropriate; remove Open questions when none remain. Keep the summary directly below the title without a heading.

Start with `status: draft` and pending acceptance. After a human decision, record the individuals, date, approval reference, approved revision and conditions for acceptance, or reasons for rejection, withdrawal, or retirement. Preserve earlier decisions when recording later ones.

For full replacements, add `supersedes` or `superseded_by` as applicable, using relative links. Leave these fields absent otherwise. Follow the standard's lifecycle and replacement rules.

## Copyable template

```markdown
---
id: rfc-NNNN
standard_revision: 1
status: draft
---

# rfc-NNNN — Subject

Summarize the proposed decision and intended outcome.

## Proposal

Explain the problem and context, what is included and excluded, the proposed design, and its consequences. Use subsections where helpful.

## Alternatives considered

Describe credible alternatives and explain why the proposal is preferred.

## Delivery and validation

Describe adoption and how the outcome will be assessed. Distinguish planned checks from completed checks and identify prototype results as exploratory.

## Open questions

List unresolved decisions and any proposed deferral boundaries and resolution conditions.

## Decision record

Acceptance is pending.

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

| Revision | Date       | Author        | Description        |
| -------- | ---------- | ------------- | ------------------ |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft      |

