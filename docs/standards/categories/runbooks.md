---
id: std-runbooks
standard_revision: 1
---

# Operational runbook standard
## Purpose and scope

Runbooks describe how operators perform a bounded operational task or respond to a defined condition. They cover procedures such as deployment, maintenance, diagnosis, backup, restoration, and incident response. They explain when to act, what to do, how to assess the result, and how to recover or escalate.

These documents MUST follow the [root documentation standard](../README.md) and the [project governance standard](../GOVERNANCE.md). Shared metadata, English sources, translations, supporting assets, copyright notices, revision histories, ownership, and publication rules apply without being redefined here.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Location and identification

Canonical runbooks MUST reside in `docs/internal/runbooks`. Files MUST use descriptive lowercase kebab-case stems, such as `restore-database.md`; related procedures MAY be grouped into subdirectories. Every authored file MUST have a stable project-unique `id`; no category-specific fields are required beyond the shared entry-file metadata.

Runbooks are internal documentation regardless of repository visibility. They describe operational procedures; architecture and configuration facts belong in [internal references](./internal-reference.md), and proposed decisions remain subject to the [RFC standard](./rfcs.md).

## Organization

Each runbook SHOULD address one task or a bounded response with a recognizable starting condition and outcome. Broader workflows MAY link to reusable procedures rather than duplicate them.

A runbook MAY be a single file or a set of linked files with a `README.md` entrypoint. The entrypoint MUST identify the task, applicability, and order of the linked procedures. Required content MAY be provided through explicit links to shared prerequisites or detailed procedure pages, provided operators can find it when needed. Impact information and stop conditions MUST be available before the actions they govern. Each supporting page MUST link back to its runbook entrypoint and retain its own metadata, notice, and revision history.

## Required content

Runbook entrypoints MUST contain the following sections in order. A section with no applicable content MUST say so explicitly. Detail SHOULD be proportionate to the operation. Instructions MAY use commands, application controls, automation, or other methods appropriate to the actual platform.

| Section | Required content |
| --- | --- |
| **Summary** | Identify the operational task or triggering condition, intended operator, and intended outcome. State when the runbook should be used and relevant exclusions. |
| **Copyright and licence** | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link. |
| **Scope and applicability** | Identify the affected system, components, environments, and relevant release or configuration boundaries. Distinguish currently applicable procedures from planned or historical ones. |
| **Prerequisites and preparation** | Describe required access, tools, inputs, dependencies, starting state, and preflight checks. Explain how to confirm the target environment. Include preparation such as a maintenance window or recoverable backup where the operation requires it. Link to existing authorization requirements rather than granting authority through the runbook. |
| **Impact and stop conditions** | Explain expected service or data impact, consequential or irreversible actions, and observable conditions requiring operators to pause, stop, or escalate. Identify relevant checkpoints before affected actions and link to recovery instructions. |
| **Procedure** | Provide ordered actions with the execution context, inputs, expected intermediate results, and conditions for proceeding or choosing a branch. Identify placeholders. Explain relevant waiting criteria, retry limits, and whether interrupted or repeated actions are safe. Link to authoritative automation and explain its invocation and observable results instead of duplicating its implementation. |
| **Verification** | Give observable checks for success and relevant failure signs. Identify expected outputs, system state, or service behaviour, with thresholds or observation periods where established. Explain what to do if a check fails; command completion alone MUST NOT imply that the operational outcome has been verified. |
| **Recovery** | Describe rollback, restoration, or other recovery actions, when each applies, prerequisites, and checks for the recovered state. State irreversible effects and limitations explicitly, including when recovery is unavailable or requires escalation. |
| **Escalation** | Identify the responsible role, team, or maintained escalation route, when to involve them, and the diagnostic context needed for a handoff. Reference maintained ownership and contact information rather than inventing separate decision authority. |
| **Validation and sources** | Link to authoritative implementation, configuration, references, and accepted decisions where relevant. Record the date, environment, applicable system version or source reference, scope, and result of performed procedure checks, with evidence where available. Distinguish execution validation, partial checks, and document review from planned checks; explicitly state when execution validation has not been performed. |
| **Revisions** | End with the numbered history required by the [shared revision rules](../README.md#revision-history). |

If a runbook uses uppercase normative keywords, it MUST include the BCP 14 declaration and RFC links given above in a **Requirement terminology** section immediately after its copyright notice. Ordinary procedural instructions do not require these keywords.

## Authority and maintenance

A runbook MUST agree with the implementation and environment to which it applies. Its existence or review MUST NOT imply that the procedure has been executed successfully, that a proposed decision has been accepted, or that an operator has authorization to perform it. Planned procedures and known validation gaps MUST be clearly identified.

Authors SHOULD validate procedures in an appropriate environment before operational use and revalidate affected steps when implementation, configuration, dependencies, or access requirements change. The validation record MUST describe what was actually checked and MUST NOT present a partial check as proof of the entire procedure. Documentation updates and review follow governance even when execution validation remains incomplete.

Release and deployment runbooks MUST account for the [required documentation review](../GOVERNANCE.md#documentation-review-during-release-and-deployment). They MAY link to an established release or deployment process that performs and records that review, rather than duplicate its checks. Required RFC acceptance remains a prerequisite for production work under the RFC standard; runbook authorship does not establish acceptance.

Historical or replaced procedures MAY remain available when their applicability is explicit. They MUST NOT be presented as the current procedure for a different system or environment. Execution results belong in the associated operational, incident, release, or deployment record; the runbook remains the maintained procedure rather than an accumulating execution log.

## Reusable model

The [runbook model](../models/runbook.md) provides a copyable starting point and guidance for linked procedures. Using the model is optional; the requirements remain defined by this standard.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
