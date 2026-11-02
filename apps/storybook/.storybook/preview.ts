/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import "./logging";
import type { Preview } from "@storybook/react-vite";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import { withTheme } from "./theme-preview";
import { withLocale } from "./locale-preview";
import "../src/styles/index.css";

const preview: Preview = {
    initialGlobals: { appearance: "system", locale: "en" },
    globalTypes: {
        locale: {
            description: "Language for stories",
            toolbar: {
                title: "Language",
                icon: "globe",
                dynamicTitle: true,
                items: [
                    { value: "en", title: "English", right: "EN" },
                    { value: "fr", title: "Français", right: "FR" },
                    { value: "de", title: "Deutsch", right: "DE" },
                    { value: "ja", title: "日本語", right: "JA" },
                ],
            },
        },
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
    decorators: [withTheme, withLocale],
    parameters: {
        layout: "fullscreen",
        controls: { expanded: true },
        backgrounds: { disable: true },
        viewport: { options: MINIMAL_VIEWPORTS },
    },
};

export default preview;
