/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useSyncExternalStore } from "react";

const darkAppearanceQuery = "(prefers-color-scheme: dark)";

/**
 * Reads whether the browser currently requests a dark colour scheme.
 *
 * @returns Whether dark appearance is preferred.
 */
function prefersDarkAppearance() {
    return window.matchMedia(darkAppearanceQuery).matches;
}

/**
 * Supplies a stable light preference during SSR and initial hydration.
 *
 * @returns The stable initial preference.
 */
function defaultAppearance() {
    return false;
}

/**
 * Subscribes to system appearance changes.
 *
 * @param onChange - Notifies React when the preference changes.
 * @returns The listener cleanup function.
 */
function subscribeToAppearance(onChange: () => void) {
    const preference = window.matchMedia(darkAppearanceQuery);
    preference.addEventListener("change", onChange);

    return () => {
        preference.removeEventListener("change", onChange);
    };
}

/**
 * Follows the operating-system colour preference without persisting application state.
 *
 * @returns The active theme appearance.
 */
export function useSystemAppearance(): "light" | "dark" {
    const prefersDark = useSyncExternalStore(subscribeToAppearance, prefersDarkAppearance, defaultAppearance);
    return prefersDark ? "dark" : "light";
}
