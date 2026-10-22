/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import config from "@whiteeclipse/toolchain/eslint";


export default defineConfig(config, {
    languageOptions: {
        parserOptions: { tsconfigRootDir: import.meta.dirname }
    }
});
