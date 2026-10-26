---
id: std-governance
---

# Project governance standard

This standard defines project ownership, approval authority, documentation maintenance, release reviews, and licensing. See the [standards entrypoint](./README.md).

## Rules

### Project ownership

- Projects MUST maintain one authoritative `CODEOWNERS` file at the repository root.
- The default `*` rule MUST identify the project owners. `/CODEOWNERS` and `/LICENCE` MUST be assigned to those owners.
- Projects MAY delegate ownership of specific paths to identifiable individuals or teams with the permissions needed to review and approve changes.
- The effective owners of a file hold approval authority for its changes and decisions.
- Changes to ownership or delegation MUST be approved by an existing project owner using the ownership configuration in effect before the change.

### Approvals

- Required approvals MUST be explicit, recorded, and given personally by the responsible human owners. Approval authority MUST NOT be delegated to agents.
- Other owners whose areas are affected SHOULD be consulted before a decision.

### Documentation maintenance

- Documentation MUST be updated whenever project changes affect its accuracy or completeness.
- Documentation-only changes MUST follow the same ownership and review rules as other changes.

### Release and deployment review

- Before a release or deployment, affected documentation MUST be reviewed for accuracy and compliance with applicable standards. Required updates MUST be completed beforehand.
- The review outcome MUST be recorded with the associated change, release, or deployment, including when no updates are needed.
- An earlier review MAY satisfy this requirement if it covers the version being released or deployed.

### Licensing

- Projects MUST maintain a root `LICENCE` file containing the complete licence text applicable by default.
- Subfolders MAY provide their own `LICENCE` file to override the inherited licence for their contents. The nearest ancestor `LICENCE` file MUST determine the applicable licence.
- Documentation copyright and licence notices MUST agree with the applicable `LICENCE` file.
- Third-party material MUST retain the copyright notices, licence notices, and attribution required by its licence. Project licences and subfolder overrides MUST NOT remove or replace these requirements.
- Licence changes, including subfolder overrides, MUST be approved by an existing project owner under the ownership rules in effect before the change.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft |
