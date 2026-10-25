---
id: toolchain-readme
standard_revision: 1
---

# @whiteeclipse/toolchain
## Overview

Shared ESLint and Prettier configuration for White Eclipse workspaces. This private, unpublished package is documented in the canonical [Toolchain package README](https://whiteeclipse.dev/docs/hypatia/internal/packages/toolchain/README.html).

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](../../../LICENCE).

## Installation and quick start

Install `@whiteeclipse/toolchain` via your preferred package manager:

```sh
bun add @whiteeclipse/toolchain
```

Create an `eslint.config.ts`:

```ts
export { default } from "@whiteeclipse/toolchain/eslint";
```

For an ESM workspace, create `.prettierrc.js`:

```js
export { default } from "@whiteeclipse/toolchain/prettier";
```

## Documentation index

- [Toolchain package](https://whiteeclipse.dev/docs/hypatia/internal/packages/toolchain/README.html): applicability, installation, and maintainers.
- [Public interfaces](https://whiteeclipse.dev/docs/hypatia/internal/packages/toolchain/interfaces.html): exported configurations and extension examples.
- [Configuration and behaviour](https://whiteeclipse.dev/docs/hypatia/internal/packages/toolchain/configuration.html): defaults, file coverage, overrides, and troubleshooting.

## Revisions

| Revision | Date       | Author        | Description              |
| -------- | ---------- | ------------- | ------------------------ |
| 1        | 2026-10-25 | Akane SHIMOKA | Adds the package README. |
