---
id: std-internal-reference
standard_revision: 1
---

# Internal reference documentation standard
## Purpose and scope

Internal references explain the current technical facts needed to understand and maintain a project. They describe implemented architecture, interfaces, configuration, data flows, and constraints, with sources and applicability.

These documents MUST follow the [root documentation standard](../README.md) and the [project governance standard](../GOVERNANCE.md). Shared metadata, English sources, translations, supporting assets, copyright notices, revision histories, ownership, and publication rules apply without being redefined here.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Location and identification

Canonical internal references MUST reside in `docs/internal/reference`. Files MUST use descriptive lowercase kebab-case stems; related subjects MAY be grouped into subdirectories. Each reference MUST have a stable project-unique `id`; no category-specific fields are required beyond the shared entry-file metadata.

This category describes current technical facts. Proposed decisions belong in RFCs or UI design proposals; user instructions and package consumer documentation belong in their respective categories. Internal classification does not imply that a document is confidential: publication and access follow governance.

## Required content

References MUST contain the following sections in this order. A section with no applicable content MUST say so explicitly. The reference SHOULD be as focused as its subject allows.

| Section                           | Required content                                                       |
| --------------------------------- | ---------------------------------------------------------------------- |
| **Summary**                       | The subject and purpose of the reference.                              |
| **Copyright and licence**         | The required copyright and licence notice.                             |
| **Scope and applicability**       | Covered components, versions, environments, and exclusions.            |
| **Reference**                     | The current technical facts needed to understand the subject.          |
| **Constraints and failure modes** | Relevant limitations, operational implications, and failure behaviour. |
| **Verification and sources**      | How the documented facts can be checked and where they originate.      |
| **Revisions**                     | The document's numbered change history.                                |

### Summary

Identify the system, subsystem, configuration, or technical concept being explained and the questions this reference answers.

### Copyright and licence

Follow the [shared notice format](../README.md#copyright-and-licence-notices) and the [project licensing rules](../GOVERNANCE.md#copyright-and-licensing). Identify the actual holders, years, and licence, and link to the project's root `LICENCE` file.

### Scope and applicability

Identify the implementation or maintained version range, applicable environments, relevant boundaries, and exclusions. Distinguish the current system from historical or planned behaviour.

### Reference

Describe the relevant architecture, responsibilities, interfaces, data flows, configuration, dependencies, or invariants. Structure subsections around the subject rather than prescribing every possible topic. Existing implementation facts MUST be distinguished from proposals and assumptions.

### Constraints and failure modes

Explain applicable compatibility, security, data-handling, and operational constraints and how relevant failures surface. State when a kind of impact does not apply. Detailed operational procedures SHOULD be linked from their authoritative location rather than copied here.

### Verification and sources

Link to authoritative implementation, configuration, tests, contracts, and accepted decisions where relevant. Explain how to verify important claims and distinguish checks already performed from planned checks. Use exact source references when a claim depends on a specific version.

### Revisions

The final **Revisions** section MUST follow the [shared revision rules](../README.md#revision-history).

## Authority and maintenance

An internal reference MUST describe the applicable implementation accurately and MUST NOT turn an unaccepted proposal into an established decision. When implementation differs from an accepted decision, the reference MUST identify the discrepancy and link to the relevant decision rather than silently rewrite its history.

Documentation updates and review follow the governance standard whenever changes affect the reference's accuracy or completeness. Historical references MAY be retained when clearly identified with their historical applicability; they MUST NOT be presented as the current reference.

## Reusable model

The [internal reference model](../models/internal-reference.md) supplies a copyable starting point. Its content must be completed for the actual subject; the standard remains authoritative.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
