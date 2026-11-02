/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import { i18nextPlugin } from "@whiteeclipse/i18next/vite";

const config: StorybookConfig = {
    framework: "@storybook/react-vite",
    stories: ["../src/**/*.stories.tsx"],
    addons: ["@storybook/addon-a11y"],
    staticDirs: ["../public"],
    core: {
        disableTelemetry: true,
        allowedHosts: [
            "storybook.hypatia.local.whiteeclipse.dev",
            "storybook.hypatia.mac.whiteeclipse.dev",
            "storybook.hypatia.cok.whiteeclipse.dev",
        ],
    },
    /**
     * Enables Tailwind utilities and application-local YAML translations in the preview.
     *
     * @param base - Storybook's Vite configuration.
     * @returns The preview configuration with styling and localization support.
     */
    viteFinal(base) {
        return mergeConfig(base, {
            plugins: [tailwindcss(), i18nextPlugin({ root: fileURLToPath(new URL("..", import.meta.url)) })],
        });
    },
};

export default config;
