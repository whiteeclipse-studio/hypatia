/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import config from "./src/eslint/index.ts";


export default defineConfig(
    config,
    {
        languageOptions: {
            parserOptions: { tsconfigRootDir: import.meta.dirname },
        },
    },
    {
        files: ["eslint.config.ts"],
        languageOptions: {
            parserOptions: { projectService: false, project: "../../../tsconfig.json" },
        },
    },
);
