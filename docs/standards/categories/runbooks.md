---
id: std-runbooks
standard_revision: 1
---

# Operational runbook standard

This standard defines documentation that helps operators perform operational tasks or respond to defined conditions. See the [standards entrypoint](../README.md).

## Rules

### Location and scope

- Runbooks MUST reside in `docs/internal/runbooks`.
- Filenames MUST use descriptive lowercase `kebab-case`, except for `README.md` entrypoints. Related procedures MAY be grouped into subfolders.
- Each runbook SHOULD cover one task or bounded response. A runbook MAY be a single file or linked files with a `README.md` entrypoint identifying their order.
- Runbooks are intended for the project's internal audience. Publication MUST preserve that audience restriction, following the [publication standard](../PUBLICATION.md).

### Procedure content

- Runbooks MUST identify when to use the procedure, its intended outcome, and applicable systems and environments.
- Runbooks MUST identify prerequisites, including access, tools, preparation, and checks that confirm the target environment. A runbook MUST NOT itself grant authorization to perform the procedure.
- Instructions MUST present actions in order, including execution context, inputs, checkpoints, and conditions for proceeding. Relevant waiting criteria, retry limits, and the safety of repeating or resuming actions MUST be explained.
- Expected impact, destructive or irreversible consequences, and stop conditions MUST be explained before the affected actions.
- Runbooks MUST provide observable success checks and explain what to do if they fail. Command completion alone MUST NOT imply success.
- Runbooks MUST explain recovery options and limitations, including when recovery is unavailable, and identify when and how to escalate.
- Content MAY be linked from shared procedures.

### Recommended structure

Runbooks SHOULD present content in this order. Short runbooks MAY combine sections:

1. Summary and applicability
2. Prerequisites
3. Impact and stop conditions
4. Procedure
5. Verification
6. Recovery and escalation

### Validation

- Planned or historical procedures and known validation gaps MUST be clearly identified.
- Authors SHOULD validate procedures in an appropriate environment before operational use and revalidate affected steps when the system changes.
- Validation records MUST identify the date, environment, system version or source reference, scope, and result of checks actually performed. Partial checks and document review MUST be distinguished from execution validation; missing execution validation MUST be stated explicitly.
- A runbook MAY summarize procedure-validation evidence or link to its validation record. Individual execution logs and results MUST be recorded with the associated operation, incident, release, or deployment rather than accumulated in the maintained procedure.

## Reusable model

The [runbook model](../models/runbook.md) provides an optional starting point.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
