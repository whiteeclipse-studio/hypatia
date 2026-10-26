---
id: std-ui-designs
standard_revision: 1
---

# UI design proposal standard

This standard defines how to propose, review, and record interface designs, including their visual direction, interactions, and implementation rules. See the [standards entrypoint](../README.md).

## Rules

### Location and scope

- Design proposals MUST reside in `docs/internal/designs/<id>/`, with a `README.md` entrypoint whose identifier matches `<id>`.
- Other filenames MUST use descriptive lowercase `kebab-case`. Supporting parts MAY be split into folders with `README.md` entrypoints.
- Designs are intended for the project's internal audience. Publication MUST preserve that audience restriction, following the [publication standard](../PUBLICATION.md).
- Design proposals MUST NOT replace an RFC when the [RFC standard](./rfcs.md#when-an-rfc-is-required) requires one.

### Proposal organization

Each proposal MUST cover the four parts below. Supporting content MAY be combined in one file or split across linked files, with headings appropriate to its subject. The main README MUST index any separate supporting files.

#### Main README

Include a summary directly below the title, scope, links to supporting files, and a decision record, followed by the shared copyright notice and revisions.

#### Inspirations

Identify inspiration sources and explain the intended design direction. Distinguish external inspiration from original design material and identify applicable attribution or reuse restrictions.

#### Design

Provide reviewable visual samples and describe relevant interactions, states, and accessibility. Samples MUST be available as supporting assets; external design links MAY supplement them. Identify illustrative approximations and missing states.

#### Implementation rules

Specify the precise values and behaviour needed to implement the design. These rules MUST be authoritative where visual samples approximate them. Link to existing foundations rather than copying them.

Component catalogues, user journeys, validation, and open questions MAY appear where useful; they do not require separate sections or files.

### Metadata and lifecycle

The main README MUST include a `status` field in addition to the [authoring metadata](../AUTHORING.md#metadata), using one of these values:

| Status       | Meaning                                                          |
| ------------ | ---------------------------------------------------------------- |
| `draft`      | Being prepared or discussed                                      |
| `accepted`   | A design revision and its supporting material have been approved |
| `rejected`   | Reviewed and declined                                            |
| `withdrawn`  | Withdrawn before acceptance                                      |
| `retired`    | Previously accepted, no longer applicable                        |
| `superseded` | Fully replaced by accepted design proposals                      |

- Supporting files MUST NOT maintain separate proposal statuses or decision records.
- Implementation progress MUST be recorded separately from lifecycle status. Acceptance MUST NOT be treated as evidence of completed implementation, verification, or release.

### Review and acceptance

- Acceptance, rejection, withdrawal, retirement, and supersession MUST be approved by the responsible owners under the [governance approval rules](../GOVERNANCE.md#approvals).
- Merging a draft or approving editorial changes MUST NOT imply acceptance of the proposal.
- The main README's decision record MUST identify the approving individuals, date, approval reference, approved README revision, conditions, and the IDs and revisions of all reviewed supporting documents. The reviewed assets MUST remain recoverable with that set in Git history.
- Questions materially affecting the design and conflicts between proposal parts MUST be resolved before acceptance. Deferred details MUST have their boundaries and resolution conditions recorded.
- Drafts MUST state that acceptance is pending. Rejection, withdrawal, and retirement MUST record their reasons. Earlier decisions MUST remain recorded when a proposal is reopened.

### Changes and replacement

- Editorial corrections and design refinements preserving the accepted scope and design intent MAY be made in place without renewed acceptance, including changes to supporting documents and assets.
- Changes to the accepted scope or design intent MUST receive renewed approval and MAY revise the existing proposal rather than require a new document. Renewed approval MUST identify the updated reviewed set.
- Full replacements MUST link both ways. The earlier proposal MUST become `superseded` only after the replacement is accepted.
- Partial replacements MUST identify the affected scope in both proposals. The earlier proposal MAY remain `accepted` for its remaining scope.
- Rejected or withdrawn proposals MAY return to `draft`, with the reason for reopening recorded. Reconsidering a retired design MUST use a new proposal.

### Validation and implementation

- Validation MUST define observable review criteria, including relevant interactions and accessibility, and distinguish planned checks, completed checks, and exploratory prototype observations.
- Exploratory prototypes MAY precede acceptance. Production implementation MUST follow an accepted design and its permitted refinements, along with any required accepted RFCs.

## Reusable model

The [UI design model](../models/ui-design.md) provides optional starting points for the proposal and its supporting parts.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
