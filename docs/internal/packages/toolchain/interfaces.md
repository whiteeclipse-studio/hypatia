---
id: package-toolchain-interfaces
---

# Toolchain public interfaces
## Overview

This reference describes the two public configuration exports of `@whiteeclipse/toolchain`.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Interface reference

### `@whiteeclipse/toolchain/eslint`

The default export is an ESLint flat configuration array, ready to pass to ESLint's `defineConfig`. It combines JavaScript, typed TypeScript, import, promise-handling, JSDoc, and JSX checks. (See the [source code](https://github.com/whiteeclipse-studio/hypatia) for details.)

### `@whiteeclipse/toolchain/prettier`

The default export is a Prettier `Config` object. (See the [source code](https://github.com/whiteeclipse-studio/hypatia) for details.)

Consumers can spread the object to supply their own options.

## Examples

An `eslint.config.ts` can extend the shared configuration for command-line scripts:

```ts
import { defineConfig } from "eslint/config";
import config from "@whiteeclipse/toolchain/eslint";

export default defineConfig(
    config,
    {
        files: ["scripts/**/*.ts"],
        rules: { "no-console": "off" },
    },
);
```

An ESM `.prettierrc.js` can change the preferred line width:

```js
import config from "@whiteeclipse/toolchain/prettier";

export default { ...config, printWidth: 100 };
```

## Revisions

| Revision | Date       | Author        | Description     |
| -------- | ---------- | ------------- | --------------- |
| 1        | 2026-10-25 | Akane SHIMOKA | Initial version |
