/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useEffect, useState, type DispatchWithoutAction } from "react";

type Appearance = "light" | "dark";

/**
 * Resolves the initial browser preference after hydration and persists explicit changes.
 *
 * @returns The current theme and a toggle that tolerates unavailable storage.
 */
export function useAppearance(): { appearance: Appearance; toggle: DispatchWithoutAction } {
    const [appearance, setAppearance] = useState<Appearance>("light");
    useEffect(function restoreAppearance(): void {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem("whiteeclipse-appearance");
        } catch {
            // The reader remains usable when browser storage is blocked.
        }
        const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setAppearance(saved === "light" || saved === "dark" ? saved : preferred);
    }, []);
    /** Changes appearance even if browser storage is unavailable. */
    function toggle(): void {
        const next = appearance === "light" ? "dark" : "light";
        setAppearance(next);
        try {
            localStorage.setItem("whiteeclipse-appearance", next);
        } catch {
            // Persistence is optional; the active session still changes theme.
        }
    }
    return { appearance, toggle };
}
