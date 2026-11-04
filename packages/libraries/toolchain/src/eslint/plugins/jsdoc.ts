/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import JSDoc from "eslint-plugin-jsdoc";


/**
 * Matches an explicit React element reference at an AST property path.
 *
 * @param path The return annotation's property path.
 * @returns A selector for imported or React-qualified ReactElement types.
 */
function reactElementAt(path: string): string {
    return `:matches([${path}.type="TSTypeReference"][${path}.typeName.name="ReactElement"], [${path}.type="TSTypeReference"][${path}.typeName.left.name="React"][${path}.typeName.right.name="ReactElement"])`;
}

// Nullable returns must contain exactly one React element type and null.
const annotation = "returnType.typeAnnotation";
const nullable = `[${annotation}.type="TSUnionType"][${annotation}.types.length=2]`;
const elementReturn = `:matches(${reactElementAt(annotation)}, ${nullable}${reactElementAt(`${annotation}.types.0`)}[${annotation}.types.1.type="TSNullKeyword"], ${nullable}${reactElementAt(`${annotation}.types.1`)}[${annotation}.types.0.type="TSNullKeyword"])`;
const componentName = "/^[A-Z][A-Za-z0-9]*$/";
const assignedFunction = ":matches(ArrowFunctionExpression, FunctionExpression)";
const componentFunction = `:matches(FunctionDeclaration[id.name=${componentName}], FunctionExpression[id.name=${componentName}], VariableDeclarator[id.name=${componentName}] > ${assignedFunction}, AssignmentExpression[left.name=${componentName}] > ${assignedFunction}, PropertyDefinition[key.name=${componentName}] > ${assignedFunction})${elementReturn}`;

// Optional component summaries must not require prop or return-tag boilerplate.
const documentedFunctions = [
    `FunctionDeclaration:not(${componentFunction})`,
    `FunctionExpression:not(${componentFunction})`,
    `ArrowFunctionExpression:not(${componentFunction})`,
];

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
                require: {
                    FunctionDeclaration: false,
                    ArrowFunctionExpression: false,
                    FunctionExpression: false,
                    MethodDefinition: true,
                },
                contexts: [
                    "TSInterfaceDeclaration",
                    `FunctionDeclaration:not(${componentFunction})`,
                    `:matches(VariableDeclarator, AssignmentExpression, ExportDefaultDeclaration, PropertyDefinition) > ${assignedFunction}:not(${componentFunction})`,
                ],
            },
        ],
        "jsdoc/require-description": "error",
        "jsdoc/require-param": [
            "error",
            { checkDestructured: false, enableFixer: false, contexts: documentedFunctions },
        ],
        "jsdoc/require-returns": ["error", { forceReturnsWithAsync: true, contexts: documentedFunctions }],
        "jsdoc/require-throws": "error",
        "jsdoc/require-throws-description": "error",
        "jsdoc/require-rejects": "error",
        "jsdoc/no-types": "error",
        "jsdoc/tag-lines": ["error", "always", { count: 0, startLines: 1 }],
    },
});
