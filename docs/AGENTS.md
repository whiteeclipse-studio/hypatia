---
id: hypatia-docs-agent-instructions
standard_revision: 1
---

# Documentation agent instructions

This file defines the rules AI agents must follow when creating, editing, or reviewing documentation in the `docs` directory. See the [documentation entrypoint](./README.md).

## Rules

### Human-driven work

- Agents MUST NOT create, edit, or delete documentation without explicit human consent.
- Agents SHOULD work section by section and obtain human confirmation before moving to the next section.
- Agents MUST stay within the authorized scope. Consent for one section does not extend to other sections.
- Agents MUST ask for missing human input rather than invent requirements or decisions.

### Writing style

- Agents MUST avoid duplicating information documented elsewhere. Restrictions imposed by a standard MUST NOT be repeated in other files.
- Agents SHOULD use plain, concise language, explain unfamiliar terms, and keep each paragraph focused on one idea.
- Agents SHOULD use headings, lists, and tables when they make information easier to scan.

### Revision tracking

- Agents MUST use one revision entry per file per commit, updating that entry as further edits are made.
- Follow the [revision history requirements](./standards/AUTHORING.md#revision-history).
- The revision author MUST be the human directing the changes, not the AI agent.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description          |
| -------- | ---------- | ------------- | -------------------- |
| 1        | 2026-10-19 | Akane SHIMOKA | Initial draft        |
| 2        | 2026-10-26 | Akane SHIMOKA | Simplify agent rules |
