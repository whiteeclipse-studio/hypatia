/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import JSDoc from "eslint-plugin-jsdoc";

export default defineConfig({
    name: "@whiteeclipse/toolchain/eslint/jsdoc",
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { jsdoc: JSDoc },
    extends: [JSDoc.configs["flat/recommended-typescript-error"]],
    rules: {
        "jsdoc/check-tag-names": ["error", { definedTags: ["rejects"] }],
        "jsdoc/require-jsdoc": [
            "error",
            {
                publicOnly: false,
                enableFixer: false,
                require: { ArrowFunctionExpression: true, FunctionExpression: true, MethodDefinition: true },
                contexts: ["TSInterfaceDeclaration"],
            },
        ],
        "jsdoc/require-description": "error",
        "jsdoc/require-param": ["error", { checkDestructured: false, enableFixer: false }],
        "jsdoc/require-returns": ["error", { forceReturnsWithAsync: true }],
        "jsdoc/require-throws": "error",
        "jsdoc/require-throws-description": "error",
        "jsdoc/require-rejects": "error",
        "jsdoc/no-types": "error",
        "jsdoc/tag-lines": ["error", "always", { count: 0, startLines: 1 }],
    },
});
