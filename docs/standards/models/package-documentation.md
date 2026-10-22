---
id: model-package-documentation
standard_revision: 1
---

# Published package documentation model

This model supports the [category standard](../categories/package-documentation.md), the [root documentation standard](../README.md), and [project governance](../GOVERNANCE.md). Those standards define the requirements; this model supplies authoring guidance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This model is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Using this model

Entry-file templates declare `standard_revision: 1` for revision 1 of their category standard. Review and deliberately change this pin when targeting a different adopted revision. Supporting pages inherit the pin from the main entrypoint and do not repeat it. The model document itself follows the shared documentation standard.

This model describes separate documentation sets under `docs/internal/packages/<package-key>/<version>`, where `<version>` is the first package version covered by the set. Start with the README, then copy only the reference or guide templates needed by the package. Public interfaces should normally have a separate reference; concise material may remain inline as permitted by the standard. The templates are not sections to concatenate into one README.

Replace identifiers, titles, notices, revision placeholders, and guidance with actual content. Every authored document needs a unique `id`, its own notice, and its own final revision table. Replace `set` in the example IDs with a stable kebab-case qualifier that distinguishes separate documentation sets; identifiers do not need to encode package versions. Keep each document's required sections in order and adjust links to its location. Version coverage is defined only by the directory path and main README; all other documents inherit it without repeating it. Migration guides still identify the transition's source and target versions. Translations follow the shared mirrored-tree and English-source-reference rules.

The example layout for `@whiteeclipse/log` is:

```text
docs/internal/packages/log/
├── README.md                  # Optional index of version ranges
├── 1.0.0/                     # Covers 1.0.0 through 2.3.4, inclusive
│   ├── README.md
│   └── interfaces.md
└── 3.0.0/                     # Covers 3.0.0 onward, open-ended
    ├── README.md
    ├── interfaces.md
    ├── configuration.md       # When needed
    ├── migrations/            # When needed
    │   └── v2-to-v3.md
    └── guides/                # Optional
        └── task.md
```

Each range has its own entrypoint and documents. Its README states the inclusive coverage bounds or explicitly identifies an open-ended range. Coverage can span major versions; the directory name always identifies the first covered release. The optional package index links to these range entrypoints and follows the shared metadata, notice, and revision rules.

The templates below assume a versioned root. A single unversioned set is also allowed: omit `<version>/` from the paths and remove one `../` from each template's licence link. Adjust other relative links for the chosen layout. When starting a new range from an existing set, update IDs, the main README coverage, links, and examples rather than carrying over the previous range's identity or scope.

Larger references can replace a single file with a directory containing an index and linked pages. Keep only links to documents that actually exist. For an authored package-local entrypoint, shorten the README template to the shape allowed by the standard and link to the accessible published documentation. Adjust its licence link for the actual package location.

## README

Copy to `docs/internal/packages/<package-key>/<version>/README.md` as the canonical entrypoint for that version range.

```markdown
---
id: package-subject-set
standard_revision: 1
---

# Subject

## Overview

Give the exact published package name, purpose, intended consumers, and main responsibilities.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../../LICENCE) file for the complete licence text.

## Applicability

State the covered package versions: the first release must match the directory name. Give an inclusive last version, such as `1.0.0` through `2.3.4`, or explicitly state an open-ended range such as `3.0.0` onward. Identify runtime and dependency requirements and compatibility or stability expectations. Link to migration guidance when needed.

## Installation and quick start

Provide installation, access, setup, and a minimal working example. Link to longer procedures rather than expanding this into a full reference.

## Documentation index

Link to the documentation that exists, with a short description of each destination. For example:

- [Public interfaces](interfaces.md): supported entrypoints and interface contracts.
- [Configuration and behaviour](configuration.md): settings and runtime behaviour.
- [Migration guide](migrations/v2-to-v3.md): the applicable migration path.
- [Task guide](guides/task.md): a longer workflow or example.

Remove unused links or replace them with actual reference entrypoints or inline anchors.

## Support and related resources

Link to accessible release information, support routes, and other relevant consumer resources.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Public interface references

Copy to `docs/internal/packages/<package-key>/<version>/interfaces.md` when this document is needed.

```markdown
---
id: package-subject-set-interfaces
---

# Subject

## Overview

Identify the interface groups covered and explain how to navigate the reference.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../../LICENCE) file for the complete licence text.

## Interface reference

Add one subsection per supported interface or group, or link to dedicated pages. Describe supported names and import or invocation paths, inputs and defaults, results, side effects, resource lifecycle, errors, examples, and deprecation or migration guidance where relevant.

## Examples

Provide representative interactions with expected results and relevant failures. Identify prerequisites and placeholders.

## Constraints and errors

Describe cross-cutting limits, error behaviour, side effects, and recovery. Link to configuration or migration details.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Configuration and behaviour references

Copy to `docs/internal/packages/<package-key>/<version>/configuration.md` when this document is needed.

```markdown
---
id: package-subject-set-configuration
---

# Subject

## Overview

Identify the configuration or runtime behaviour covered by this document.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../../LICENCE) file for the complete licence text.

## Prerequisites

Identify relevant environments and required setup or dependencies.

## Configuration reference

Document each setting, including name, type, allowed values, default, purpose, sources, precedence, interactions, and relevant examples.

## Runtime behaviour

Describe relevant initialization, resource lifecycle, cleanup, concurrency, limits, side effects, and recovery; state what does not apply.

## Troubleshooting

Explain symptoms, configuration mistakes, diagnostics, and practical recovery or support routes.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Migration guides

Copy to `docs/internal/packages/<package-key>/<version>/migrations/v2-to-v3.md` when this document is needed.

```markdown
---
id: package-subject-set-migration
---

# Subject

## Overview

Describe the migration and the consumers who need it.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../../../LICENCE) file for the complete licence text.

## Versions and prerequisites

Identify source and target versions, supported paths, required runtimes or dependencies, access, and preparation.

## Breaking changes

Explain affected interfaces, defaults, configuration, and behaviour. Include concrete before-and-after examples where useful.

## Migration steps

Give ordered consumer changes, including relevant configuration or data transformations and dependencies between steps.

## Validation and recovery

Describe checks for success and recovery or rollback options. Identify irreversible changes or recovery limitations.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Task guides and examples

Copy to `docs/internal/packages/<package-key>/<version>/guides/task.md` when this document is needed.

```markdown
---
id: package-subject-set-guide-task
---

# Subject

## Overview

Identify the task and intended outcome.

## Copyright and licence

Copyright © YYYY Copyright Holder.

This document is released under Licence Name. See the project's root [LICENCE](../../../../../../LICENCE) file for the complete licence text.

## Prerequisites

Identify required setup, permissions, dependencies, and knowledge.

## Instructions

Provide complete ordered actions or a worked example, explaining inputs, choices, and consequential operations.

## Expected results

Describe the observable result and how consumers verify success.

## Troubleshooting

Describe likely failures and practical recovery or support routes, or state that none apply.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | YYYY-MM-DD | Akane SHIMOKA | Initial draft |
```

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
