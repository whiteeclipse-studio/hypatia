---
id: std-public-documentation
standard_revision: 1
---

# Public user guide and API documentation standard
## Purpose and scope

Public user guides explain how to accomplish tasks. Public API documentation describes interfaces consumers can use. These are two profiles of one public documentation category; each profile has its own required content.

These documents MUST follow the [root documentation standard](../README.md) and the [project governance standard](../GOVERNANCE.md). Shared metadata, English sources, translations, supporting assets, copyright notices, revision histories, ownership, and publication rules apply without being redefined here.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Location and identification

Canonical user guides MUST reside in `docs/public/guides`. Canonical API documentation MUST reside in `docs/public/api`. Files MUST use descriptive lowercase kebab-case stems; related documents MAY be grouped into subdirectories. Each document MUST have its own stable project-unique `id`; no category-specific fields are required beyond the shared entry-file metadata.

The document body MUST identify its applicability to product or interface versions. Published package documentation follows the [package documentation standard](./package-documentation.md), including its source placement and access rules.

## Required content

Each guide and each API documentation entrypoint MUST contain the sections for its profile in the order below. A section with no applicable content MUST state that explicitly. Content MAY be split into linked documents when the entrypoint identifies their scope and readers can find the required information. Supporting API reference pages MAY use a subject-specific structure while retaining the shared metadata, notice, and revision requirements.

### User guides

| Section | Required content |
| --- | --- |
| **Overview** | The user task and intended outcome. |
| **Copyright and licence** | The required copyright and licence notice. |
| **Audience and prerequisites** | Intended readers, supported versions, access, and required setup. |
| **Instructions** | The ordered actions needed to complete the task. |
| **Expected results** | Observable signs that the task succeeded. |
| **Troubleshooting** | Likely failure cases and practical recovery. |
| **Related information** | Accessible next steps and related references. |
| **Revisions** | The document's numbered change history. |

#### Overview

Explain what the guide helps the reader accomplish and when to use it.

#### Copyright and licence

Follow the [shared notice format](../README.md#copyright-and-licence-notices) and the [project licensing rules](../GOVERNANCE.md#copyright-and-licensing). Identify the actual holders, years, and licence, and link to the project's root `LICENCE` file.

#### Audience and prerequisites

Identify the audience, applicable product versions or maintained version range, permissions, prior knowledge, and required setup. State when a prerequisite does not apply.

#### Instructions

Provide complete steps with the relevant commands, interface labels, inputs, and choices. Explain consequential actions and recovery options where relevant. The guide MUST remain usable without access to internal documentation.

#### Expected results

Describe the expected output or resulting state and how the reader can verify it. Distinguish illustrative output from exact values the reader should expect.

#### Troubleshooting

Describe relevant symptoms, likely causes, and recovery actions or support routes. State explicitly when no task-specific troubleshooting applies.

#### Related information

Link to relevant public guides, API references, or package documentation. Required information MUST be accessible to the guide's intended readers; internal decision records MAY provide optional background but MUST NOT be needed to follow the guide.

#### Revisions

The final **Revisions** section MUST follow the [shared revision rules](../README.md#revision-history).

### API documentation

| Section | Required content |
| --- | --- |
| **Overview** | The interface and the consumers it serves. |
| **Copyright and licence** | The required copyright and licence notice. |
| **Applicability** | The interface version, stability, and compatibility scope. |
| **Access and setup** | Connection details, authentication, authorization, and setup. |
| **Interface contract** | Supported operations, inputs, outputs, and observable behaviour. |
| **Examples** | Representative valid interactions and results. |
| **Errors and limits** | Failure responses, restrictions, and recovery expectations. |
| **Revisions** | The document's numbered change history. |

#### Overview

Identify the interface, its purpose, and the boundary it exposes. Explain whether the document covers the complete interface or a defined subset.

#### Copyright and licence

Follow the [shared notice format](../README.md#copyright-and-licence-notices) and the [project licensing rules](../GOVERNANCE.md#copyright-and-licensing). Identify the actual holders, years, and licence, and link to the project's root `LICENCE` file.

#### Applicability

Identify the API version or maintained version range, relevant runtime or transport assumptions, stability guarantees, and any deprecated behaviour. Planned interfaces MUST be clearly distinguished from released interfaces.

#### Access and setup

Describe how consumers reach or load the interface, obtain appropriate access, and configure required inputs. Separate authentication from operation-specific authorization. State when access or setup requirements do not apply.

#### Interface contract

Describe names or routes, input and output structures, types, required and optional values, defaults, constraints, and side effects. Explain relevant pagination, ordering, retries, idempotency, and concurrency behaviour, or state that they do not apply. Details MUST agree with the authoritative contract and implementation for the documented version; link to maintained schemas or generated references where available.

#### Examples

Provide examples sufficient to use the documented interface, including relevant failure cases. Examples MUST match the documented contract and MUST NOT contain live credentials. Identify placeholders and environment-specific values.

#### Errors and limits

Explain error conditions and representations, relevant codes, limits, and consumer recovery behaviour. Include compatibility or migration links when consumers must change their use of the interface.

#### Revisions

The final **Revisions** section MUST follow the [shared revision rules](../README.md#revision-history).

## Source authority and maintenance

Public documentation MUST describe the applicable released or currently available behaviour. Future behaviour MAY be documented when it is explicitly identified as planned and does not appear to be available already.

Machine-readable contracts and generated API references MAY supplement authored Markdown. Their authoritative source and documented version MUST be identified, and generated references MUST identify their input. Independently maintained contradictory copies MUST NOT be introduced. Examples and instructions MUST be checked against the version they document, with the relevant verification recorded in the associated review.

Review, updates, publication, and release or deployment checks follow the governance standard. Public documentation MUST remain understandable without access to internal proposals or references.

## Reusable models

The [user guide model](../models/user-guide.md) and [API reference model](../models/api-reference.md) provide starting points for the two profiles. Models do not introduce additional requirements.

## Revisions

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
