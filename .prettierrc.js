/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import config from "@whiteeclipse/toolchain/prettier";

export default {
    ...config,
    overrides: [
        {
            files: "apps/website/**/*.{ts,tsx,js,jsx,html,css}",
            options: { tailwindStylesheet: "./apps/website/src/shared/theme/styles.css" },
        },
        {
            files: "apps/storybook/**/*.{ts,tsx,js,jsx,html,css}",
            options: { tailwindStylesheet: "./apps/storybook/src/styles/index.css" },
        },
    ],
};
