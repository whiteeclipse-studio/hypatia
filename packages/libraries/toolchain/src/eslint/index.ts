/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import globals from "globals";

import core from "./plugins/core.ts";
import typescript from "./plugins/typescript.ts";
import importX from "./plugins/import-x.ts";
import jsdoc from "./plugins/jsdoc.ts";

/** Shared checks for source, configuration, and scripts; generated output is excluded. */
export default defineConfig(
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/storybook-static/**",
            "**/coverage/**",
            ".idea/**",
            ".obsidian/**",
        ],
    },
    core,
    typescript,
    importX,
    jsdoc,
    {
        name: "@whiteeclipse/toolchain/eslint/runtime",
        files: ["**/*.{js,mjs,cjs}", "**/*.config.{ts,mts,cts}", "**/scripts/**/*.{ts,mts,cts}"],
        languageOptions: { globals: globals.node },
    },
    {
        name: "@whiteeclipse/toolchain/eslint/browser",
        files: ["**/src/**/*.{js,jsx,ts,tsx}", "**/.storybook/**/*.{ts,tsx}"],
        languageOptions: { globals: globals.browser },
    },
    {
        name: "@whiteeclipse/toolchain/eslint/jsx",
        files: ["**/*.{jsx,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector:
                        "JSXExpressionContainer CallExpression[callee.type='MemberExpression'][callee.property.name='map']",
                    message: "Move array mapping above the JSX or into a component or hook (RFC-0002).",
                },
            ],
        },
    },
);
