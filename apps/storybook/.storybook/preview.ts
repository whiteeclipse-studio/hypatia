/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Preview } from "@storybook/react-vite";
import { withTheme } from "./theme-preview";
import "../src/styles/index.css";

const preview: Preview = {
    initialGlobals: { appearance: "system" },
    globalTypes: {
        appearance: {
            description: "Colour theme for Storybook and its stories",
            toolbar: {
                title: "Theme",
                icon: "circlehollow",
                dynamicTitle: true,
                items: [
                    { value: "light", title: "Light", icon: "sun" },
                    { value: "dark", title: "Dark", icon: "moon" },
                    { value: "system", title: "System", icon: "browser" },
                ],
            },
        },
    },
    decorators: [withTheme],
    parameters: {
        layout: "fullscreen",
        controls: { expanded: true },
    },
};

export default preview;
