---
id: model-package-documentation
standard_revision: 1
---

# Package documentation model

Optional starting points for a package README and additional documentation. See the [standards entrypoint](../README.md) and [package documentation standard](../categories/package-documentation.md).

## Using this model

Start with a README alongside the package code, outside `docs`. Replace placeholders, select the adopted standards entrypoint revision, and adjust links. The headings are suggestions; keep only content useful to consumers.

Use the second template when more detail is needed. Place it in `docs/internal/packages/<package-key>/README.md`, or a version directory as described by the standard. State version coverage there and let supporting pages inherit it. Replace the example documentation URL with its canonical published URL, accessible to the package's audience; remove the link if no additional documentation exists.

## Package README

```markdown
---
id: package-subject
standard_revision: 1
---

# Package name

Explain what the package does and who it is for.

## Installation and usage

Explain installation or setup and give a minimal usage example, where applicable.

<!-- Include relevant compatibility requirements, such as runtimes or peer dependencies. -->

[Full documentation](https://example.com/package-documentation)

## Copyright and licence

Copyright © YYYY Copyright Holder.

Released under [Licence Name](https://example.com/LICENCE).

## Revisions

| Revision | Date       | Author       | Description   |
| -------- | ---------- | ------------ | ------------- |
| 1        | YYYY-MM-DD | Human Author | Initial draft |
```

## Additional documentation README

```markdown
---
id: package-subject-documentation
standard_revision: 1
---

# Package name documentation

Identify the package and explain what this documentation covers.

## Version coverage

State the covered version or range. For a separate range directory, give the inclusive end or identify the range as currently active with an open upper bound.

## Documentation

<!-- Add detailed information here and index any supporting files. -->
<!-- Organize interface references, configuration, and examples as useful. -->
<!-- Migration instructions identify source and target versions, required changes, and result checks. Include recovery guidance for data changes or changes that cannot easily be undone. -->

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
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
