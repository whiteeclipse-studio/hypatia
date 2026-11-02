/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useEffect, useState, type RefObject } from "react";
import { useLocale } from "@whiteeclipse/i18next";
import { sections, type PageId } from "./fixtures";

const headingOffset = 24;
const bottomTolerance = 2;

/**
 * Tracks the current section within the reading pane, including after locale and size changes.
 *
 * @param reader - The independently scrolling reading pane.
 * @param page - The selected fixture page.
 * @returns The current section's anchor identifier.
 */
export function useActiveSection(reader: RefObject<HTMLElement | null>, page: PageId): string {
    const { locale } = useLocale();
    const [activeSection, setActiveSection] = useState("");
    /** Tracks headings inside the independently scrolling reading pane. */
    useEffect(() => {
        const pane = reader.current;
        if (!pane) {
            return;
        }
        let ids = sections.map(section => `document-${section}`);
        if (page === "overview" || page === "guides") {
            ids = ["document-directory"];
        }
        const firstSection = ids[0] ?? "";
        /** Selects the last section heading that has passed beneath the sticky document bar. */
        function updateSection(): void {
            if (!pane) {
                return;
            }
            const threshold =
                (pane.firstElementChild?.getBoundingClientRect().bottom ?? pane.getBoundingClientRect().top) +
                headingOffset;
            let current = firstSection;
            for (const id of ids) {
                const heading = pane.querySelector<HTMLElement>(`#${id}`);
                if (heading && heading.getBoundingClientRect().top <= threshold) {
                    current = id;
                }
            }
            if (
                pane.scrollHeight > pane.clientHeight &&
                pane.scrollTop + pane.clientHeight >= pane.scrollHeight - bottomTolerance
            ) {
                current = ids[ids.length - 1] ?? current;
            }
            setActiveSection(current);
        }
        updateSection();
        pane.addEventListener("scroll", updateSection, { passive: true });
        const resize = new ResizeObserver(updateSection);
        resize.observe(pane);
        const article = pane.querySelector("article");
        if (article) {
            resize.observe(article);
        }
        return () => {
            pane.removeEventListener("scroll", updateSection);
            resize.disconnect();
        };
    }, [page, locale, reader]);
    return activeSection;
}
