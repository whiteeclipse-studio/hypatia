/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import TypeScript from "typescript-eslint";

export default defineConfig(
    {
        name: "@whiteeclipse/toolchain/eslint/typescript",
        files: ["**/*.{ts,tsx,mts,cts}"],
        extends: [...TypeScript.configs.strictTypeChecked, ...TypeScript.configs.stylisticTypeChecked],
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: false }],
            "class-methods-use-this": "off",
            "@typescript-eslint/class-methods-use-this": ["error", { ignoreOverrideMethods: true }],
            "@typescript-eslint/consistent-type-exports": ["error", { fixMixedExportsWithInlineTypeSpecifier: true }],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports", disallowTypeAnnotations: true },
            ],
            "default-param-last": "off",
            "@typescript-eslint/default-param-last": "error",
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "max-params": "off",
            "@typescript-eslint/max-params": ["error", { max: 4 }],
            "@typescript-eslint/method-signature-style": ["error", "method"],
            "@typescript-eslint/no-import-type-side-effects": "error",
            "no-magic-numbers": "off",
            "@typescript-eslint/no-magic-numbers": [
                "error",
                {
                    ignore: [0, 1],
                    ignoreArrayIndexes: true,
                    ignoreNumericLiteralTypes: true,
                    ignoreTypeIndexes: true,
                },
            ],
            "@typescript-eslint/no-useless-empty-export": "error",
            "@typescript-eslint/promise-function-async": ["error", { allowAny: false }],
            "@typescript-eslint/require-array-sort-compare": "error",
            "@typescript-eslint/strict-void-return": "error",
            "@typescript-eslint/no-unsafe-type-assertion": "error",
            "@typescript-eslint/switch-exhaustiveness-check": "error",
            "@typescript-eslint/strict-boolean-expressions": ["error", { allowString: false, allowNumber: false }],
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
            "@typescript-eslint/no-unused-expressions": ["error", { allowTaggedTemplates: true }],
            "@typescript-eslint/no-dynamic-delete": "off",
        },
    },
    {
        name: "@whiteeclipse/toolchain/eslint/typescript/tests",
        files: ["**/*.{spec,test}.{ts,tsx,mts,cts}"],
        rules: { "@typescript-eslint/no-magic-numbers": "off" },
    },
);
