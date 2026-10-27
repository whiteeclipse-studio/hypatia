/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Theme } from "@radix-ui/themes";
import type { Decorator } from "@storybook/react-vite";
import { useSyncExternalStore } from "react";

const systemAppearance = window.matchMedia("(prefers-color-scheme: dark)");

/**
 * Subscribes the preview to operating-system theme changes.
 *
 * @param onChange - Notifies React when the preference changes.
 * @returns A callback that removes the listener on unmount.
 */
function subscribe(onChange: () => void): () => void {
    systemAppearance.addEventListener("change", onChange);
    return () => {
        systemAppearance.removeEventListener("change", onChange);
    };
}

/**
 * Reads the current system preference.
 *
 * @returns Whether the system currently requests a dark theme.
 */
function getSystemDark(): boolean {
    return systemAppearance.matches;
}

/**
 * Wraps every story in the toolbar-selected theme, following live system changes in System mode.
 *
 * @param Story - The story being rendered.
 * @param context - Storybook context containing the selected global appearance.
 * @returns The story inside a shared Core UI theme boundary.
 */
export const withTheme: Decorator = function WithTheme(Story, context) {
    const systemDark = useSyncExternalStore(subscribe, getSystemDark);
    const selected: unknown = context.globals["appearance"];
    let appearance: "light" | "dark" = systemDark ? "dark" : "light";
    if (selected === "light" || selected === "dark") {
        appearance = selected;
    }

    return (
        <Theme appearance={appearance} grayColor="sand" accentColor="gray" radius="none">
            <Story />
        </Theme>
    );
};
