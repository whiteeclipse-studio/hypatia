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

With dependencies installed, run `bun run lint` from the repository root to check all packages and applications, or from
an individual workspace to check only that workspace. The toolchain workspace imports its own source configuration
directly. Consuming workspaces may load the built entrypoint, so rebuild the toolchain after changing shared rules.
Passing `--conditions=development` to `bun run` does not propagate that condition to the ESLint subprocess.

To load shared rules from source, invoke ESLint directly from the repository root:

```sh
bun --conditions=development ./node_modules/.bin/eslint .
```

For consumers using the built entrypoints, run checks from the workspace root:

```sh
bunx --bun --no-install eslint .
bunx --bun --no-install prettier --check .
```

Use ESLint's `--fix` or Prettier's `--write` to apply available fixes, then review the changes. ESLint cannot automatically fix every finding.

## Configuration behaviour

The package exposes two default exports; it has no package-root export:

- **`@whiteeclipse/toolchain/eslint`:** a flat configuration array combining JavaScript correctness, type-aware TypeScript, import boundaries, promise handling, JSDoc, readability, and JSX checks.
- **`@whiteeclipse/toolchain/prettier`:** a configuration object using 120-column lines, four-space indentation, double
  quotes, semicolons, trailing commas, and LF endings. It includes `prettier-plugin-packagejson` for package-file
  formatting and `prettier-plugin-tailwindcss` for automatic utility-class ordering. The Tailwind plugin loads last.

Typed linting uses TypeScript's project service, so checked TypeScript files need an appropriate `tsconfig.json`. Import
resolution supports Bun and checks `tsconfig.json` in the current directory as well as projects at
`apps/*/tsconfig.json` and `packages/*/*/tsconfig.json`. Repository workspace configurations set `tsconfigRootDir` to
their own directory, and their TypeScript projects include the ESLint configuration and relevant scripts.

JSDoc is required on interfaces, standalone functions, and class methods. PascalCase function declarations and assigned
functions with an explicit `ReactElement` or `React.ReactElement` return annotation may omit JSDoc; a union with `null`
is also supported. Inferred returns, type aliases, hooks, and other return types do not receive this exception. These
components may also use summary-only JSDoc without `@param` or `@returns`. Other checks, including supplied tag names
and parameter names, still apply. Object-literal methods and function-valued
properties do not require duplicate comments; document their contracts on the corresponding types. Any JSDoc supplied on
an implementation is still checked.

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

### Tailwind class formatting

Use the shared Prettier configuration to sort utility classes consistently. Tailwind recommends its official plugin
in [Automatic Class Sorting with Prettier](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier). Sorting
groups related utilities and state variants; it does not shorten long class lists or automatically split them into
logical groups.

For Tailwind CSS v4, consuming workspaces must configure `tailwindStylesheet` with the CSS entrypoint, relative to their
Prettier configuration file:

```js
import config from "@whiteeclipse/toolchain/prettier";

export default {
    ...config,
    tailwindStylesheet: "./src/styles/index.css",
};
```

Hypatia's root configuration supplies separate stylesheet overrides for Website and Storybook. See the
plugin's [stylesheet configuration](https://github.com/tailwindlabs/prettier-plugin-tailwindcss#specifying-your-tailwind-stylesheet-path-tailwind-css-v4)
and [plugin-order requirement](https://github.com/tailwindlabs/prettier-plugin-tailwindcss#compatibility-with-other-prettier-plugins)
when extending this setup.

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

| Revision | Date       | Author        | Description                                                        |
|----------|------------|---------------|--------------------------------------------------------------------|
| 1        | 2026-10-25 | Akane SHIMOKA | Adds the package README.                                           |
| 2        | 2026-10-26 | Akane SHIMOKA | Consolidate documentation                                          |
| 3        | 2026-10-27 | Codex         | Add built JavaScript, declaration, and development exports         |
| 4        | 2026-10-30 | Codex         | Document repository and workspace lint commands                    |
| 5        | 2026-10-30 | Akane SHIMOKA | Clarify object-literal JSDoc exemptions and shared rule loading    |
| 6        | 2026-11-04 | Akane SHIMOKA | Add Tailwind class sorting and the React component JSDoc exception |
