/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createRequire } from "node:module";
import type { Config } from "prettier";


const require = createRequire(import.meta.url);

/** Shared formatting options, retaining Arcadia's formatting and package key order. */
const config: Config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    quoteProps: "as-needed",
    jsxSingleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "avoid",
    endOfLine: "lf",
    plugins: [
        require.resolve("prettier-plugin-packagejson"),
        // Tailwind's plugin must be last to preserve compatibility with other plugins.
        require.resolve("prettier-plugin-tailwindcss"),
    ],
};

export default config;
