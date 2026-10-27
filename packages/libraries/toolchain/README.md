---
id: toolchain-readme
standard_revision: 1
---

# @whiteeclipse/toolchain

Shared ESLint and Prettier configurations for White Eclipse's JavaScript and TypeScript workspaces. This README covers `0.1.0-alpha.1`, a private workspace package that is not published to a registry.

## Setup

Add the package to a consuming workspace's development dependencies, then run `bun install`:

```json
{
    "devDependencies": {
        "@whiteeclipse/toolchain": "workspace:*"
    }
}
```

Install compatible peers according to [package.json](./package.json):

| Peer       | Supported versions |
| ---------- | ------------------ |
| ESLint     | `^10.10.0`         |
| Prettier   | `^3.9.6`           |
| TypeScript | `>=5.9.3 <6.1.0`   |

Run `bun run --cwd packages/libraries/toolchain build` from the repository root before consuming the package. Entrypoints select built `dist/*.js` files by default, adjacent `.d.ts` files for types, and source `.ts` files when the consumer enables the `development` condition. The examples run tools with Bun; the built configuration entrypoints also load through Node ESM.

Create `eslint.config.ts` at the workspace root:

```ts
import { defineConfig } from "eslint/config";
import config from "@whiteeclipse/toolchain/eslint";

export default defineConfig(config, {
    languageOptions: {
        parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
});
```

For an ESM workspace, create `.prettierrc.js`:

```js
export { default } from "@whiteeclipse/toolchain/prettier";
```

## Running checks

With dependencies installed, run checks from the workspace root:

```sh
bunx --bun --no-install eslint .
bunx --bun --no-install prettier --check .
```

Use ESLint's `--fix` or Prettier's `--write` to apply available fixes, then review the changes. ESLint cannot automatically fix every finding.

## Configuration behaviour

The package exposes two default exports; it has no package-root export:

- **`@whiteeclipse/toolchain/eslint`:** a flat configuration array combining JavaScript correctness, type-aware TypeScript, import boundaries, promise handling, JSDoc, readability, and JSX checks.
- **`@whiteeclipse/toolchain/prettier`:** a configuration object using 120-column lines, four-space indentation, double quotes, semicolons, trailing commas, and LF endings. It includes `prettier-plugin-packagejson` for package-file formatting.

Typed linting uses TypeScript's project service, so checked TypeScript files need an appropriate `tsconfig.json`. Import resolution supports Bun and assumes projects at `apps/*/tsconfig.json` and `packages/*/*/tsconfig.json`.

JavaScript files, configuration files, and scripts receive Node globals. Source files under `src` and Storybook files receive browser globals; overlapping patterns can receive both. Test files relax selected function-name, numeric-literal, and named-capture rules while retaining other checks.

ESLint ignores dependency directories, `dist`, `storybook-static`, `coverage`, `.idea`, and `.obsidian`. Prettier's file selection is controlled separately by the consumer's command targets and ignore file.

See the [ESLint entrypoint](./src/eslint/index.ts), [rule groups](./src/eslint/plugins/), and [Prettier configuration](./src/prettier.ts) for complete settings.

## Extending configurations

Append file-specific ESLint configuration to the shared array. For example, declare the Bun global for scripts that use its APIs:

```ts
import { defineConfig } from "eslint/config";
import config from "@whiteeclipse/toolchain/eslint";

export default defineConfig(config, {
    files: ["scripts/**/*.ts"],
    languageOptions: { globals: { Bun: "readonly" } },
});
```

Spread the Prettier configuration to customize an option:

```js
import config from "@whiteeclipse/toolchain/prettier";

export default { ...config, printWidth: 100 };
```

## Troubleshooting

| Symptom                                                    | Action                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| TypeScript or ESM configuration cannot load                | Run the tools with Bun and ensure ESM `.js` configuration files belong to a `"type": "module"` package.            |
| A plugin or peer cannot resolve                            | Restore workspace dependencies and check the peer ranges above.                                                    |
| The package root or an internal subpath cannot be imported | Use the public `/eslint` or `/prettier` entrypoint.                                                                |
| TypeScript project-service parsing fails                   | Include the file in the appropriate `tsconfig.json` and verify `tsconfigRootDir`.                                  |
| Imports fail in a different workspace layout               | Override the resolver's project paths and declare the resolver dependency in the consumer.                         |
| A file receives inappropriate globals or is not checked    | Review the environment patterns, shared ignores, and command targets; apply a file-specific override where needed. |

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                |
| -------- | ---------- | ------------- | ---------------------------------------------------------- |
| 1        | 2026-10-25 | Akane SHIMOKA | Adds the package README.                                   |
| 2        | 2026-10-26 | Akane SHIMOKA | Consolidate documentation                                  |
| 3        | 2026-10-27 | Codex         | Add built JavaScript, declaration, and development exports |
