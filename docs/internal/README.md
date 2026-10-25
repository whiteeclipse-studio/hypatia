---
id: hypatia-documentation-map
standard_revision: 1
---

# Documentation map

This map introduces Hypatia's documentation files. Start with the standards for authoring and governance, the RFCs for proposed technical decisions, and the Core UI proposal for exploratory interface work. The Core UI design, package, and prototype documentation will be rewritten from scratch after exploration; their current contents do not establish accepted production behaviour. Paths below are relative to `docs`.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE) file for the complete licence text.

## File map

| File                                                                                                          | Purpose                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AGENTS.md](../AGENTS.md)                                                                                     | Human direction and agent constraints for documentation work.                                                                                                   |
| [standards/README.md](../standards/README.md)                                                                 | Shared format, placement, metadata, revisions, and link rules.                                                                                                  |
| [standards/GOVERNANCE.md](../standards/GOVERNANCE.md)                                                         | Ownership, approval, publication, proposed rendering security, versioning, and licensing.                                                                       |
| [standards/categories/rfcs.md](../standards/categories/rfcs.md)                                               | Technical proposal content, lifecycle, and decision records.                                                                                                    |
| [standards/categories/ui-designs.md](../standards/categories/ui-designs.md)                                   | Design proposal organization, review, and acceptance.                                                                                                           |
| [standards/categories/internal-reference.md](../standards/categories/internal-reference.md)                   | Current technical facts, applicability, and verification sources.                                                                                               |
| [standards/categories/public-documentation.md](../standards/categories/public-documentation.md)               | Public task guides and API reference requirements.                                                                                                              |
| [standards/categories/package-documentation.md](../standards/categories/package-documentation.md)             | Package entrypoints, consumer references, and version coverage.                                                                                                 |
| [standards/categories/runbooks.md](../standards/categories/runbooks.md)                                       | Operational procedures, verification, recovery, and escalation.                                                                                                 |
| [standards/models/rfc.md](../standards/models/rfc.md)                                                         | Copyable technical proposal template.                                                                                                                           |
| [standards/models/ui-design.md](../standards/models/ui-design.md)                                             | Templates for a design proposal and its supporting parts.                                                                                                       |
| [standards/models/internal-reference.md](../standards/models/internal-reference.md)                           | Copyable technical reference template.                                                                                                                          |
| [standards/models/user-guide.md](../standards/models/user-guide.md)                                           | Copyable public task guide template.                                                                                                                            |
| [standards/models/api-reference.md](../standards/models/api-reference.md)                                     | Copyable public API reference template.                                                                                                                         |
| [standards/models/package-documentation.md](../standards/models/package-documentation.md)                     | Package README, interface, configuration, migration, and task templates.                                                                                        |
| [standards/models/runbook.md](../standards/models/runbook.md)                                                 | Copyable operational procedure template.                                                                                                                        |
| [internal/README.md](README.md)                                                                               | This documentation map.                                                                                                                                         |
| [internal/rfcs/0001-repository-structure.md](rfcs/0001-repository-structure.md)                               | Draft repository layout and directory responsibilities.                                                                                                         |
| [internal/rfcs/0002-tech-stack.md](rfcs/0002-tech-stack.md)                                                   | Draft technology, engineering, documentation build, and deployment requirements.                                                                                |
| [internal/rfcs/0003-internationalization.md](rfcs/0003-internationalization.md)                               | Draft reusable React localization design covering the shared i18next package, YAML namespaces, language selection, rendering, adoption, and planned validation. |
| [internal/designs/core-ui/README.md](designs/core-ui/README.md)                                               | Draft interface foundation, review scope, and post-exploration rewrite plan.                                                                                    |
| [internal/designs/core-ui/components.md](designs/core-ui/components.md)                                       | Exploratory component inventory and state contracts.                                                                                                            |
| [internal/designs/core-ui/implementation-rules.md](designs/core-ui/implementation-rules.md)                   | Proposed visual values, interaction rules, and accessibility criteria.                                                                                          |
| [internal/designs/core-ui/mockups.md](designs/core-ui/mockups.md)                                             | Sample compositions, captures, asset provenance, and limitations.                                                                                               |
| [internal/designs/core-ui/inspirations/README.md](designs/core-ui/inspirations/README.md)                     | Inspiration sources and intended design direction.                                                                                                              |
| [internal/designs/core-ui/inspirations/nier-automata.md](designs/core-ui/inspirations/nier-automata.md)       | Primary visual reference and its bounded interpretation.                                                                                                        |
| [internal/designs/core-ui/inspirations/bootstrap.md](designs/core-ui/inspirations/bootstrap.md)               | Reference for useful component families.                                                                                                                        |
| [internal/designs/core-ui/inspirations/radix-primitives.md](designs/core-ui/inspirations/radix-primitives.md) | Reference for component interaction and keyboard behaviour.                                                                                                     |
| [internal/reference/storybook-prototype.md](reference/storybook-prototype.md)                                 | Exploratory workspace usage, samples, and historical checks.                                                                                                    |
| [internal/packages/core-ui/README.md](packages/core-ui/README.md)                                             | Exploratory workspace package usage and current distribution limits.                                                                                            |
| [internal/packages/toolchain/README.md](packages/toolchain/README.md) | Shared ESLint and Prettier configuration, workspace setup, exports, and limitations. |
| [internal/packages/toolchain/interfaces.md](packages/toolchain/interfaces.md) | Toolchain public configuration exports, extension examples, and import constraints. |
| [internal/packages/toolchain/configuration.md](packages/toolchain/configuration.md) | Toolchain defaults, file coverage, overrides, execution, and troubleshooting. |

Design images and wireframes reside in `internal/designs/core-ui/assets/` and are described by the mockups document. Obsolete exploratory assets will be dropped during the Core UI rewrite.

## Revisions

| Revision | Date       | Author               | Description                                                                   |
| -------- | ---------- | -------------------- | ----------------------------------------------------------------------------- |
| 1        | 2026-10-22 | Akane SHIMOKA, Codex | Initial draft, including the completed RFC-0003 proposal awaiting acceptance. |
| 2 | 2026-10-25 | Codex | Index the toolchain package README and interface and configuration references. |
