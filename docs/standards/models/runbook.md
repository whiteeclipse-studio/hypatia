---
id: model-runbook
standard_revision: 1
---

# Operational runbook model

An optional starting point for operational procedures. See the [standards entrypoint](../README.md) and [runbook standard](../categories/runbooks.md).

## Using this model

Copy the template to `docs/internal/runbooks/subject.md` or a folder with a `README.md` entrypoint. Replace placeholders, select the adopted standards entrypoint revision, and adjust links. Short runbooks can combine sections; longer runbooks can link to shared prerequisites or procedure pages in execution order.

Replace the validation placeholder only with checks actually performed. Summarize the evidence validating the procedure or link to its validation record; keep individual execution logs in their associated operational records.

## Copyable template

```markdown
---
id: runbook-subject
standard_revision: 1
---

# Operational task

Identify the task or triggering condition, intended operator, outcome, and applicable systems and environments. Identify planned or historical procedures where relevant.

## Prerequisites

List required access, tools, inputs, preparation, and starting-state checks. Explain how to confirm the target environment and link to existing authorization requirements.

## Impact and stop conditions

Explain expected service or data impact and irreversible consequences. Identify conditions requiring a pause, stop, or escalation before the affected actions.

## Procedure

1. Confirm the target environment and starting state.
2. Describe concrete actions in order, including context, inputs, checkpoints, and conditions for proceeding.
3. Perform the verification below.

<!-- Explain relevant waiting criteria, retry limits, and whether actions can safely be repeated or resumed. -->

## Verification

Give observable success checks and explain the response to each failure. Include expected state, outputs, or thresholds where relevant.

## Recovery and escalation

Describe recovery options, prerequisites, limitations, and checks for the recovered state. State when recovery is unavailable. Link to the maintained escalation route and explain when to use it and what context to provide.

## Validation

No execution validation has been recorded.

<!-- Replace with performed checks: date, environment, system version or source reference, scope, and results. Distinguish partial checks and document review from execution validation, and identify remaining gaps. -->

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

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
