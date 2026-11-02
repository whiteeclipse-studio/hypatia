/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import "./logging";
import { getLogger } from "@whiteeclipse/log";
import {
    GLOBALS_UPDATED,
    SET_GLOBALS,
    UPDATE_GLOBALS,
    STORY_THREW_EXCEPTION,
    STORY_ERRORED,
    STORY_RENDERED,
} from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import "@whiteeclipse/core-ui/styles.css";

const logger = getLogger(["whiteeclipse", "storybook", "manager"]);

const appearance = window.matchMedia("(prefers-color-scheme: dark)");
let selectedAppearance: unknown = "system";

/** Applies Core UI's computed tokens to Storybook's separate manager renderer. */
function applyManagerTheme() {
    let base: "light" | "dark" = "light";
    if (appearance.matches) {
        base = "dark";
    }
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
            brandImage: "",
            brandTitle: [
                '<span style="display: inline-flex; align-items: center; gap: 8px; white-space: nowrap">',
                `<img src="./favicon/icon-${base}.svg" alt="" style="width: 24px; height: 24px; max-width: 24px; flex: none" />`,
                `<span style='font-family: ${token("--brand-font-family")}; font-size: 20px; font-weight: 500'>White Eclipse</span>`,
                "</span>",
            ].join(""),
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
    logger.debug("Applied manager theme.", { appearance: base });
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
    const selected = globals["appearance"];
    if (selected === "light" || selected === "dark" || selected === "system") {
        selectedAppearance = selected;
        applyManagerTheme();
    }
}

/**
 * Attaches theme synchronization after Storybook initializes its real manager channel.
 *
 * @param api - The initialized manager API.
 */
addons.register("white-eclipse/appearance", function registerAppearance(api): void {
    api.on(SET_GLOBALS, updateAppearance);
    api.on(GLOBALS_UPDATED, updateAppearance);
    api.on(UPDATE_GLOBALS, updateAppearance);
    updateAppearance({ globals: api.getGlobals() });
});

/**
 * Records a story exception without replacing Storybook's error presentation.
 *
 * @param error The error reported by the preview.
 */
function logStoryError(error: unknown): void {
    logger.error("Story rendering failed.", { error });
}

/**
 * Records completed story rendering without logging story arguments.
 *
 * @param storyId The rendered story identifier.
 */
function logStoryRendered(storyId: string): void {
    logger.trace("Rendered story {storyId}.", { storyId });
}

/**
 * Subscribes diagnostics to the initialized Storybook manager channel.
 *
 * @param api The initialized manager API.
 */
addons.register("white-eclipse/logging", function registerLogging(api): void {
    api.on(STORY_THREW_EXCEPTION, logStoryError);
    api.on(STORY_ERRORED, logStoryError);
    api.on(STORY_RENDERED, logStoryRendered);
});
