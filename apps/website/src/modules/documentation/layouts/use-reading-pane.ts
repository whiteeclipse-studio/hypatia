/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { type RefObject, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import type { DocumentData, PageData } from "../domain/types";


/**
 * Manages reading-pane focus, scroll restoration, title and active heading state.
 *
 * @param page Current route data.
 * @param document Selected localized document.
 * @param projectName Current project display name.
 * @returns The reading-pane reference and active contents anchor.
 */
export function useReadingPane(
    page: PageData | undefined,
    document: DocumentData | undefined,
    projectName: string,
): { main: RefObject<HTMLElement | null>; activeSection: string } {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState("");
    const main = useRef<HTMLElement>(null);
    const first = useRef(true);
    const scrollPositions = useRef(new Map<string, number>());
    useEffect(() => {
        const pane = main.current;
        if (pane === null || page === undefined) {
            return;
        }
        globalThis.document.title = `${document?.title ?? page.title} · ${projectName}`;
        if (location.hash === "") {
            pane.scrollTop = scrollPositions.current.get(location.key) ?? 0;
        } else {
            requestAnimationFrame(() => {
                globalThis.document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
            });
        }
        if (!first.current) {
            pane.focus({ preventScroll: true });
        }
        first.current = false;
        return () => {
            scrollPositions.current.set(location.key, pane.scrollTop);
        };
    }, [page, document, projectName, location.key, location.hash]);
    useEffect(() => {
        const pane = main.current;
        if (pane === null || document === undefined) {
            return;
        }
        const observer = new IntersectionObserver(
            entries => {
                const visible = entries.find(entry => entry.isIntersecting);
                if (visible !== undefined) {
                    setActiveSection(visible.target.id);
                }
            },
            { root: pane, rootMargin: "0px 0px -65% 0px" },
        );
        for (const heading of pane.querySelectorAll("h2[id],h3[id]")) {
            observer.observe(heading);
        }
        return () => {
            observer.disconnect();
        };
    }, [document]);
    return { main, activeSection };
}
