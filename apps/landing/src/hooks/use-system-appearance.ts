import { useSyncExternalStore } from 'react';

const darkAppearanceQuery = '(prefers-color-scheme: dark)';

/** Reads whether the browser currently requests a dark colour scheme. */
function prefersDarkAppearance() {
    return window.matchMedia(darkAppearanceQuery).matches;
}

/** Supplies a stable light preference when no browser environment is available. */
function defaultAppearance() {
    return false;
}

/** Subscribes to system appearance changes and returns the listener cleanup. */
function subscribeToAppearance(onChange: () => void) {
    const preference = window.matchMedia(darkAppearanceQuery);
    preference.addEventListener('change', onChange);

    return () => preference.removeEventListener('change', onChange);
}

/** Follows the operating-system colour preference without persisting application state. */
export function useSystemAppearance(): 'light' | 'dark' {
    const prefersDark = useSyncExternalStore(subscribeToAppearance, prefersDarkAppearance, defaultAppearance);
    return prefersDark ? 'dark' : 'light';
}
