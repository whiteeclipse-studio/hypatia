---
id: package-toolchain-configuration
---

# Toolchain configuration and behaviour
## Overview

This reference describes the shared ESLint and Prettier settings, consumer overrides, and execution behaviour.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Configuration reference

### ESLint

The shared configuration is assembled in [the ESLint entrypoint](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/toolchain/src/eslint/index.ts). It supplies these settings:

| Setting                    | Default and effect                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source coverage            | JavaScript checks cover `js`, `jsx`, `mjs`, `cjs`, `ts`, `tsx`, `mts`, and `cts`. Typed checks cover `ts`, `tsx`, `mts`, and `cts`.                                           |
| Global ignores             | `**/node_modules/**`, `**/dist/**`, `**/storybook-static/**`, `**/coverage/**`, `.idea/**`, and `.obsidian/**`.                                                               |
| TypeScript project service | `languageOptions.parserOptions.projectService` is `true`, enabling type-aware rules.                                                                                          |
| Import resolution          | `settings["import-x/resolver-next"]` uses the TypeScript resolver with `bun: true` and projects `apps/*/tsconfig.json` and `packages/*/*/tsconfig.json`.                      |
| Node globals               | Applied to `**/*.{js,mjs,cjs}`, `**/*.config.{ts,mts,cts}`, and `**/scripts/**/*.{ts,mts,cts}`.                                                                               |
| Browser globals            | Applied to `**/src/**/*.{js,jsx,ts,tsx}` and `**/.storybook/**/*.{ts,tsx}`. Overlapping patterns can receive both environments.                                               |
| Test exceptions            | Files matching `**/*.{spec,test}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` relax function-name, numeric-literal, and named-capture rules where applicable. Other checks remain active. |

ESLint enables five groups of checks:

- **JavaScript correctness:** catch common bugs and unused code.
- **Type safety:** catch unsafe TypeScript usage and unhandled promises.
- **Imports:** prevent dependency cycles and enforce package boundaries.
- **Documentation:** require JSDoc for functions and interfaces.
- **Readability:** encourage consistent style, limit complexity, and keep JSX simple.

### Prettier

The Prettier configuration exports the following options:

| Option            | Shared default                              |
| ----------------- | ------------------------------------------- |
| `printWidth`      | `120`                                       |
| `tabWidth`        | `4`                                         |
| `useTabs`         | `false`                                     |
| `semi`            | `true`                                      |
| `singleQuote`     | `false`                                     |
| `quoteProps`      | `"as-needed"`                               |
| `jsxSingleQuote`  | `false`                                     |
| `trailingComma`   | `"all"`                                     |
| `bracketSpacing`  | `true`                                      |
| `bracketSameLine` | `false`                                     |
| `arrowParens`     | `"avoid"`                                   |
| `endOfLine`       | `"lf"`                                      |
| `plugins`         | Resolved `prettier-plugin-packagejson` path |

Refer to the [Prettier configuration guide](https://prettier.io/docs/configuration) for additional details.

## Troubleshooting

| Symptom                                             | Action                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration cannot load TypeScript or ESM         | Use the documented runtime and ESLint TypeScript-config loader; verify that ESM `.js` configuration files belong to a `"type": "module"` package. |
| Plugin or peer dependency cannot be resolved        | Restore workspace dependencies with `bun install --frozen-lockfile` and verify the peer versions in the package README.                           |
| Package root or internal subpath cannot be imported | Use the public `/eslint` or `/prettier` entrypoint.                                                                                               |
| TypeScript project-service parsing error            | Include the file in the appropriate `tsconfig.json` and verify `tsconfigRootDir`.                                                                 |
| Imports do not resolve in another workspace layout  | Override the TypeScript resolver's project paths and declare the resolver dependency in the consumer.                                             |
| Node-only source receives browser globals           | Scope a consumer environment override to those files; the shared `src` pattern is browser-oriented.                                               |
| Expected files are not checked                      | Review shared ignores, the consumer's patterns, and the command's target paths.                                                                   |
| Formatting check reports differences                | Inspect the changes from `bun run format`, or target specific files with Prettier before applying a repository-wide rewrite.                      |
| A lint finding remains after `lint:fix`             | Correct it manually; only rules offering automatic fixes can be fixed by ESLint.                                                                  |

## Revisions

| Revision | Date       | Author        | Description     |
| -------- | ---------- | ------------- | --------------- |
| 1        | 2026-10-25 | Akane SHIMOKA | Initial version |
