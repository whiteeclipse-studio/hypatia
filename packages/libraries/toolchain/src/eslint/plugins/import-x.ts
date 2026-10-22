/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { defineConfig } from "eslint/config";
import ImportX from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

export default defineConfig({
    name: "@whiteeclipse/toolchain/eslint/import-x",
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { "import-x": ImportX },
    settings: {
        "import-x/resolver-next": [
            createTypeScriptImportResolver({
                bun: true,
                project: ["apps/*/tsconfig.json", "packages/*/*/tsconfig.json"],
            }),
        ],
    },
    rules: {
        "import-x/no-deprecated": "error",
        "import-x/no-extraneous-dependencies": "error",
        "import-x/no-cycle": "error",
        "import-x/no-relative-packages": "error",
    },
});
