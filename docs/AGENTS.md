---
id: hypatia-docs-agent-instructions
standard_revision: 1
---

# Documentation agent instructions

These instructions apply throughout `docs`, in addition to the [root agent instructions](../AGENTS.md) and the applicable [documentation standards](./standards/README.md). Requirement keywords follow the standards' [BCP 14 terminology](./standards/README.md#requirement-terminology).

## Human-driven documentation

- Documentation MUST be driven by explicit human input. Agents MUST NOT write, expand, rewrite, or remove documentation content without explicit human permission for that work.
- Standards and RFCs MUST be written collaboratively with the human, at the scope and pace they specify. Permission to work on one section MUST NOT be treated as permission to draft other sections.
- A request to scaffold a document authorizes its required structure and administrative boilerplate only. Agents MUST NOT fill substantive sections or add proposed requirements, decisions, examples, alternatives, questions, or drafting guidance unless explicitly requested.
- Agents MUST NOT infer permission from a document's topic, existing code, related documents, or what would make a proposal more complete. Missing human input MUST remain unwritten; agents MUST ask before adding it.
- If applicable standards require content beyond the authorized scope, agents MUST explain what is missing and request human input rather than inventing content. An unfinished scaffold MUST NOT be presented as a complete proposal ready for review.
- Permission to draft or edit documentation MUST NOT be treated as approval or acceptance; the [governance standard](./standards/GOVERNANCE.md) continues to apply.

## Revision numbering

- Agents MUST increment a file's Revision number only when that file has not already been changed in the current commit. Further edits to the same file within that commit MUST update the existing revision entry rather than add another.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the root [LICENCE](../LICENCE) file for the complete licence text.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-19 | Akane SHIMOKA | Initial draft |
