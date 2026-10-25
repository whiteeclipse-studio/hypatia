---
id: package-toolchain
standard_revision: 1
---

# Toolchain package
## Overview

`@whiteeclipse/toolchain` provides shared ESLint and Prettier configuration for White Eclipse's JavaScript and TypeScript workspaces.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Applicability

Covers `0.1.0-alpha.1`.
### Peer Dependendies
| name       | version        |
| ---------- | -------------- |
| eslint     | 10.10.0        |
| prettier   | 3.9.6          |
| TypeScript | >=6.1.0 <7.0.0 |

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

- [Public interfaces](interfaces.md): exported configurations, examples, and import constraints.
- [Configuration and behaviour](configuration.md): defaults, file coverage, overrides, execution, and troubleshooting.

## Support and related resources

See the [package source](https://github.com/whiteeclipse-studio/hypatia/tree/main/packages/libraries/toolchain) for the complete rule configuration.

## Revisions

| Revision | Date       | Author        | Description     |
| -------- | ---------- | ------------- | --------------- |
| 1        | 2026-10-25 | Akane SHIMOKA | Initial version |
