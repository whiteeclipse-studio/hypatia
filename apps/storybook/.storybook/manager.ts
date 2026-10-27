/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import "@whiteeclipse/core-ui/styles.css";

const appearance = window.matchMedia("(prefers-color-scheme: dark)");
let selectedAppearance: unknown = "system";

/** Applies Core UI's computed tokens to Storybook's separate manager renderer. */
function applyManagerTheme() {
    let base: "light" | "dark" = appearance.matches ? "dark" : "light";
    if (selectedAppearance === "light" || selectedAppearance === "dark") {
        base = selectedAppearance;
    }
    const boundary = document.createElement("div");
    boundary.className = `radix-themes ${base}`;
    boundary.dataset["grayColor"] = "sand";
    boundary.hidden = true;
    document.body.append(boundary);
    const tokens = getComputedStyle(boundary);

    /**
     * Reads a shared CSS token while the temporary theme boundary is mounted.
     *
     * @param name - Custom property to read.
     * @returns The resolved token value.
     */
    function token(name: string): string {
        return tokens.getPropertyValue(name).trim();
    }

    const foreground = token("--gray-12");
    const surface = token("--gray-1");
    const panel = token("--gray-2");
    const secondary = token("--gray-11");
    const border = token("--core-ui-border-color");

    addons.setConfig({
        theme: create({
            base,
            brandTitle: "White Eclipse",
            brandImage: "./favicon/favicon.svg",
            brandUrl: "./",
            brandTarget: "_self",
            fontBase: token("--default-font-family"),
            fontCode: token("--code-font-family"),
            colorPrimary: foreground,
            colorSecondary: foreground,
            appBg: surface,
            appContentBg: panel,
            appPreviewBg: surface,
            appBorderColor: border,
            appBorderRadius: 0,
            textColor: foreground,
            textMutedColor: secondary,
            textInverseColor: surface,
            barTextColor: secondary,
            barSelectedColor: foreground,
            barHoverColor: foreground,
            barBg: panel,
            inputBg: surface,
            inputBorder: foreground,
            inputTextColor: foreground,
            inputBorderRadius: 0,
            buttonBg: panel,
            buttonBorder: border,
        }),
    });
    boundary.remove();
}

applyManagerTheme();
appearance.addEventListener("change", applyManagerTheme);

/**
 * Synchronizes the manager with initial and toolbar-updated Storybook globals.
 *
 * @param event - Current global values emitted by the preview.
 * @param event.globals - Shared story settings, including the selected appearance.
 */
function updateAppearance({ globals }: { globals: Record<string, unknown> }): void {
    selectedAppearance = globals["appearance"];
    applyManagerTheme();
}

addons.getChannel().on(SET_GLOBALS, updateAppearance);
addons.getChannel().on(GLOBALS_UPDATED, updateAppearance);
