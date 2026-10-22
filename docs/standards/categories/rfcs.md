---
id: std-rfcs
standard_revision: 1
---

# RFC documentation standard
## Purpose and scope

Request for Comments documents, abbreviated **RFCs**, describe proposed features and technical decisions. They explain the problem, the proposed solution, its consequences, and the alternatives considered.

An RFC provides a basis for discussion and preserves the reasoning behind a decision. Acceptance records agreement with that decision; it does not establish that the feature has been implemented, verified, or released.

These documents MUST follow the [root documentation standard](../README.md) and the [project governance standard](../GOVERNANCE.md). Shared metadata, English sources, translations, supporting assets, copyright notices, revision histories, ownership, and publication rules apply without being redefined here.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Location and format

RFCs MUST reside in `docs/internal/rfcs` at the root of their project.

RFCs MUST be Markdown files. Diagrams, mockups, and other supporting assets MAY accompany them, but the proposal and decision MUST remain understandable from the Markdown document.

Supporting assets maintained specifically for an RFC MUST follow the [supporting asset rules](../README.md#supporting-assets) in the root documentation standard. RFCs SHOULD link to independently maintained UI designs or runbooks in their respective documentation categories instead of duplicating them.

RFCs and their supporting assets are internal documentation.

## When an RFC is required

An RFC MUST precede acceptance of:

- A substantial new feature or substantial change to existing behaviour.
- A change to an established architecture or technical decision.
- A breaking change to a supported interface or data contract.
- A decision with significant consequences for security, data handling, deployment, or operation.

Routine maintenance, implementation details within an accepted design, and corrections that restore intended behaviour MAY proceed without a new RFC.

Amendments to `docs/standards/README.md` and `docs/standards/GOVERNANCE.md` follow the [project-owner approval rules](../GOVERNANCE.md#changes-to-documentation-and-governance-standards).

The document's depth SHOULD reflect the decision's complexity. A focused decision MAY have a short RFC, provided it meets the requirements below.

Pre-production prototyping MAY begin before an RFC is accepted. Production work implementing the proposed decision MUST NOT start before the relevant RFC is accepted.

## Naming and identification

Each RFC MUST have an identifier unique within its project, formatted as `rfc-NNNN`, using a lowercase prefix and four digits.

Files MUST be named `NNNN-subject.md`, with a descriptive subject in `kebab-case`. Their title MUST follow this form:

`# rfc-NNNN — Subject`

RFC numbers MUST be allocated in sequence using the next unused number. Authors MUST check the target branch for numbering conflicts before merging an RFC.

Allocated numbers MUST NOT be reused, including when a draft is deleted or an RFC is rejected, retracted, or superseded. Previously allocated numbers MUST remain discoverable in repository history when an RFC is deleted. The identifier MUST remain stable when the title changes.

References between projects MUST identify the project as well as the RFC number.

## Metadata

Every RFC MUST follow the [shared document format and metadata rules](../README.md#document-format-and-metadata) and begin with YAML front matter containing:

| Field    | Requirement                                |
| -------- | ------------------------------------------ |
| `id`     | The stable `rfc-NNNN` identifier           |
| `standard_revision` | The required revision of this RFC standard |
| `status` | A lifecycle value defined below            |

The following fields are required when applicable:

| Field           | Requirement                                              |
| --------------- | -------------------------------------------------------- |
| `supersedes`    | Relative links to RFCs fully replaced by this RFC        |
| `superseded_by` | Relative links to accepted RFCs fully replacing this RFC |

Optional fields MUST be omitted until applicable.

## Lifecycle

| Status       | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| `draft`      | Being prepared or discussed; no decision has been accepted |
| `accepted`   | Approved as the project's intended direction               |
| `rejected`   | Reviewed and declined                                      |
| `retracted`  | Withdrawn before acceptance, or retired after acceptance without a replacement |
| `superseded` | Fully replaced by one or more accepted RFCs                |

Drafts MAY change freely as discussion progresses.

Authority to reject or retract an RFC belongs to the same decision makers authorized to accept it, including retraction before acceptance.

A rejected or retracted proposal that was never accepted MAY return to `draft` for reconsideration. Its earlier decision and the reason for reopening MUST remain recorded. Reconsideration of a previously accepted and subsequently retracted decision MUST use a new RFC.

Implementation progress MUST be described separately from RFC status. An accepted RFC MUST NOT be treated as evidence of completed delivery.

## Required content

Every RFC MUST provide enough information for reviewers to assess its scope, feasibility, consequences, and alternatives. It MUST contain the following sections in this order; their content requirements are described below the table:

| Section                        | Required content                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Summary**                    | The proposal and its intended outcome                                                                            |
| **Copyright and licence**      | Notice following the shared formatting and licensing rules                                                       |
| **Requirement terminology**    | BCP 14 declaration, references, and uppercase-only interpretation                                                |
| **Context and motivation**     | The concrete problem, relevant constraints, and why a decision is needed                                         |
| **Scope**                      | What the proposal covers and explicitly excludes                                                                 |
| **Proposed design**            | Expected behaviour, requirements, boundaries, and examples sufficient to review the decision                     |
| **Consequences and drawbacks** | Costs, risks, limitations, and maintenance or operational burdens                                                |
| **Alternatives considered**    | Credible alternatives, including retaining the current approach where relevant, and reasons for the preference   |
| **Delivery and validation**    | Adoption approach, affected documentation, and observable criteria for assessing the result                      |
| **Open questions**             | Decisions still unresolved                                                                                       |
| **Decision record**            | Outcome, responsible decision makers, date, and, for acceptance, the approved revision number and any conditions |
| **Revisions**                  | Numbered table of meaningful changes, starting at revision 1                                                     |

A section with no applicable content MUST state that explicitly. Sections MUST NOT be left empty in a submitted proposal.

RFCs MUST briefly assess compatibility, data migration, security, rollout, and recovery where relevant to the proposal. These assessments MAY appear within the existing sections. Where an impact does not apply, state that briefly.

### Summary

Summarize the proposed decision, its scope, and the intended outcome. Give readers enough context to understand the purpose of the proposal before reading its detailed design.

### Copyright and licence

Identify the copyright holders, applicable years, and licence. RFCs MUST follow the [shared notice format](../README.md#copyright-and-licence-notices) and the [project's licensing rules](../GOVERNANCE.md#copyright-and-licensing).

### Requirement terminology

Every RFC MUST include the BCP 14 declaration and RFC 2119 and RFC 8174 links given in this standard's **Requirement terminology** section, including the uppercase-only interpretation of requirement keywords.

Authors SHOULD consistently use **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**.

### Context and motivation

Describe the current situation, the concrete problem, relevant constraints, and why a decision is needed. Explain how existing decisions or limitations motivate the proposal.

An RFC SHOULD link to related documentation when it exists. Such references can establish context here or support the relevant sections below.

### Scope

State what the proposal covers and explicitly excludes. Make the boundaries clear enough to distinguish the decision under review from work or decisions reserved for elsewhere.

### Proposed design

Describe the expected behaviour, requirements, boundaries, and examples needed to assess the decision. Distinguish the proposed behaviour from the current situation described in **Context and motivation**.

The proposed design MAY include subsections appropriate to its subject, such as API contracts, data migration, accessibility, compatibility, security, or recovery.

### Consequences and drawbacks

Explain the costs, risks, limitations, and maintenance or operational burdens introduced by the proposal. Briefly assess compatibility and security impacts where relevant, or state when they do not apply.

### Alternatives considered

Describe credible alternatives and explain why the proposed design is preferred. Include retaining the current approach where relevant, with its tradeoffs.

### Delivery and validation

Describe the adoption approach, affected documentation, and observable criteria for assessing the result. Briefly assess data migration, rollout, and recovery where relevant, or state when they do not apply.

Delivery and validation MUST distinguish planned checks from checks already performed. Prototype results MUST be identified as exploratory work rather than accepted production behaviour. Detailed deployment procedures belong in operation runbooks, which this section can reference.

### Open questions

List unresolved decisions, or state that none remain. Questions that materially affect the decision MUST be resolved before acceptance. Remaining questions MAY be deferred when their boundaries and resolution conditions are recorded.

### Decision record

Acceptance MUST be explicit and recorded in this section. An RFC's decision record MUST identify the approving individual or individuals, the decision date, and a link to the review or other recorded approval. When approval comes from a team, the record MUST identify the individual who approved on its behalf.

Acceptance records MUST also identify the approved revision number and any conditions. Rejection and retraction MUST record their reason. Earlier decisions MUST remain recorded when an unaccepted proposal returns to `draft`.

A draft's decision record MUST state that acceptance is pending.

### Revisions

Every RFC's final **Revisions** section MUST follow the [shared revision rules](../README.md#revision-history). Lifecycle changes and replacement notices MUST receive a new revision entry in addition to other meaningful changes.

The approved revision's contents MUST remain recoverable from Git history.

## Review and acceptance

RFC acceptance, rejection, and retraction MUST receive explicit approval from at least one decision maker designated by the project's ownership rules, as defined in the [project governance standard](../GOVERNANCE.md#project-ownership-and-decision-authority).

Authorship or elapsed discussion time MUST NOT imply acceptance.

Merging a draft or approving an editorial change MUST NOT imply acceptance of its proposal. Approval MUST explicitly cover the decision and the version of the proposal being accepted.

## Changes and historical integrity

After acceptance, editorial corrections and clarifications that preserve the decision MAY be made in place.

A substantive change to an accepted decision MUST be proposed through a new RFC. The original decision text MUST remain available as a historical record.

Full replacement MUST establish links in both directions and mark the earlier RFC `superseded` only after the replacement is accepted.

Partial replacement MUST identify the affected sections in both documents. The earlier RFC MAY remain `accepted` for its remaining scope.

## Relationship to other documentation

RFCs preserve decisions and their reasoning. User guides, API documentation, UI designs, and operation runbooks describe their respective subjects and MUST be maintained in the locations defined by the documentation structure standard.

Related internal documentation SHOULD link back to the RFC when its reasoning helps readers understand the current design.

Public documentation MUST remain understandable without access to an internal RFC.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft |
