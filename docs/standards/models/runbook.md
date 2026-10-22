---
id: model-runbook
standard_revision: 1
---

# Operational runbook model

This model supports the [runbook standard](../categories/runbooks.md), the [root documentation standard](../README.md), and [project governance](../GOVERNANCE.md). Those standards define the requirements; this model supplies authoring guidance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

Copy the template to `docs/internal/runbooks/subject.md`. Replace the identifier, title, notice, revision placeholders, and guidance with actual content. Keep the required sections in order and explicitly state when content does not apply. No status or validation fields are required in front matter. Translations follow the shared mirrored-tree and English-source-reference rules.

Describe one bounded task or response. Give concrete commands, application actions, or automation instructions appropriate to the actual platform, without assuming a particular language, operating system, or deployment tool. Replace placeholders and illustrative output before treating them as executable instructions. Runbook authorship and review do not establish operational authorization, decision acceptance, or successful execution.

Longer runbooks can use `docs/internal/runbooks/subject/README.md` with linked procedure pages. Keep the existing ID when moving an entrypoint, give each new authored page its own ID, notice, and revisions, and provide navigation back to the entrypoint. Adjust relative links: the root licence link becomes `../../../../LICENCE` at that depth. Supporting assets follow the shared location and document-ID naming rules.

Linked pages can provide shared prerequisites or detailed steps, but the entrypoint identifies the order and where each required topic is covered. Keep impact information and stop conditions available before the relevant actions. Use existing references and scripts as authoritative sources rather than maintaining independent copies.

The template uses ordinary imperative instructions. If a runbook needs uppercase normative keywords, insert the BCP 14 declaration and RFC links from the category standard after the copyright notice.

## Copyable template

```markdown
---
id: runbook-subject
standard_revision: 1
---

# Subject

## Summary

Identify the operational task or triggering condition, intended operator, and intended outcome. Explain when to use this runbook and relevant exclusions.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Scope and applicability

Identify the system, components, environments, and relevant release or configuration boundaries. Clearly identify planned or historical procedures.

## Prerequisites and preparation

List required access, tools, inputs, dependencies, and starting-state checks. Explain how to confirm the target environment. Include required maintenance arrangements or recoverable backups where relevant. Link to existing authorization requirements.

## Impact and stop conditions

Explain expected service or data impact and consequential or irreversible actions. List observable conditions requiring a pause, stop, or escalation, with checkpoints before affected actions. Link to the recovery instructions below.

## Procedure

1. Confirm the target and starting state using the prerequisite checks. State the expected result and the condition for continuing.
2. Replace this guidance with concrete ordered actions, their execution context, inputs, and expected intermediate results. Describe branches, waiting criteria, retry limits, and whether interrupted or repeated actions are safe where relevant.
3. Perform the verification below. If it fails, follow the documented recovery or escalation path.

Link to authoritative automation where used and explain invocation, parameters, and observable results. For release or deployment procedures, include or link to the established process for documentation review and its recorded outcome.

## Verification

Give observable success checks and failure signs. Describe expected outputs, system state, or service behaviour and any established thresholds or observation periods. Explain the response to a failed check. Distinguish illustrative outputs from exact expected values.

## Recovery

Describe rollback, restoration, or other recovery actions, when each applies, prerequisites, and checks of the recovered state. Identify irreversible effects and limitations, including when recovery is unavailable or escalation is required.

## Escalation

Link to the responsible role, team, or maintained escalation route. State when to involve them and which diagnostic context is needed for a handoff. Follow the project's existing ownership and access rules.

## Validation and sources

Link to authoritative implementation, configuration, references, and accepted decisions where relevant.

No execution validation has been recorded. Replace this statement when checks are actually performed, recording the date, environment, applicable system version or source reference, checked steps, observed results, and supporting evidence. Distinguish execution validation, partial checks, and document review from planned checks. Keep individual operational execution logs in their associated records rather than accumulating them here.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
