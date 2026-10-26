---
id: std-rfcs
standard_revision: 1
---

# RFC documentation standard

This standard defines how Request for Comments (RFC) documents propose decisions and preserve their reasoning, review, and outcomes. See the [standards entrypoint](../README.md).

## Rules

### Location and scope

- RFCs MUST reside in `docs/internal/rfcs`.
- RFCs MUST preserve a proposed decision, its reasoning, and its recorded outcome.
- RFCs are intended for the project's internal audience. Publication MUST preserve that audience restriction, following the [publication standard](../PUBLICATION.md).

### When an RFC is required

An RFC MUST precede acceptance of:

- A substantial new feature or a substantial change to existing behaviour.
- A change to an established architecture or technical decision.
- A breaking change to a supported interface or data contract.
- A decision with significant security, data-handling, deployment, or operational consequences.

Routine maintenance, implementation details within an accepted design, and corrections restoring intended behaviour MAY proceed without a new RFC.

Prototyping MAY begin before acceptance. Production implementation MUST wait until the relevant RFC is accepted.

### Naming and identification

- RFC identifiers MUST use `rfc-NNNN`, with four digits.
- Files MUST use `NNNN-subject.md`, with a descriptive `kebab-case` subject.
- Titles MUST use `# rfc-NNNN — Subject`.
- Numbers MUST be allocated sequentially, checked for conflicts before merging, and MUST NOT be reused.
- References between projects MUST identify both the project and RFC number.

### Metadata and lifecycle

Each RFC MUST include a `status` field in addition to the [authoring metadata](../AUTHORING.md#metadata), using one of these values:

| Status       | Meaning                                   |
| ------------ | ----------------------------------------- |
| `draft`      | Being prepared or discussed               |
| `accepted`   | Approved as the intended direction        |
| `rejected`   | Reviewed and declined                     |
| `withdrawn`  | Withdrawn before acceptance               |
| `retired`    | Previously accepted, no longer applicable |
| `superseded` | Fully replaced by accepted RFCs           |

- When full replacement applies, `supersedes` and `superseded_by` MUST contain relative links to the RFCs replaced or replacing this RFC, respectively. These fields MUST be omitted until applicable.
- Implementation progress MUST be recorded separately from lifecycle status. Acceptance MUST NOT be treated as evidence of completed implementation, verification, or release.

### Review and acceptance

- Acceptance, rejection, withdrawal, retirement, and supersession MUST be approved by the responsible owners under the [governance approval rules](../GOVERNANCE.md#approvals).
- Merging a draft or approving editorial changes MUST NOT imply acceptance of the proposal.
- Acceptance MUST explicitly cover the proposed decision and a numbered revision. The decision record MUST identify that revision and any conditions of acceptance.
- Questions materially affecting the decision MUST be resolved before acceptance. Deferred questions MUST have their boundaries and resolution conditions recorded.
- Rejection, withdrawal, and retirement MUST record their reasons. Earlier decisions MUST remain recorded when a proposal is reopened.

### Changes and replacement

- Editorial corrections preserving an accepted decision MAY be made in place. Substantive changes to an accepted revision MUST use a new RFC.
- Full replacements MUST link both ways. The earlier RFC MUST become `superseded` only after the replacement is accepted.
- Partial replacements MUST identify the affected sections in both RFCs. The earlier RFC MAY remain `accepted` for its remaining scope.
- Rejected or withdrawn proposals MAY return to `draft`, with the reason for reopening recorded. Reconsidering a retired decision MUST use a new RFC.

### Required structure

Every RFC MUST begin with a summary directly below its title, without a section heading, followed by the required sections below in order. Required sections MUST NOT be empty in a submitted proposal; where nothing applies, they MUST state that briefly. Optional sections MUST appear before the Decision record.

#### Summary

The text directly below the title MUST summarize the proposed decision and intended outcome.

#### Proposal

Explain the problem, context, scope, proposed design, and consequences. These topics MAY use subsections rather than separate top-level sections.

#### Alternatives considered

Describe credible alternatives and explain why the proposal is preferred.

#### Decision record

Record the outcome, responsible individuals (including those acting for a team), decision date, and approval reference, or state that acceptance is pending for drafts.

#### Copyright and licence

Include the notice required by the [authoring standard](../AUTHORING.md#required-notices).

#### Revisions

Include the history required by the [authoring standard](../AUTHORING.md#revision-history).

#### Optional sections

A **Delivery and validation** section SHOULD be included for changes requiring implementation. Planned checks MUST be distinguished from completed checks, and prototype results MUST be identified as exploratory. An **Open questions** section MAY be included while unresolved issues remain.

## Reusable model

The [RFC model](../models/rfc.md) provides an optional starting point.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft |
