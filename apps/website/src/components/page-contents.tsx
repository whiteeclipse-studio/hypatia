/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import type { RenderedPage } from "@whiteeclipse/documentation-builder/browser";
import { articleHeadings } from "../headings.ts";

/** Current sanitized document and its project context for the section rail. */
interface ContentsProps {
    page: RenderedPage | null;
    projectName: string | null;
}

const firstSectionDepth = 2;

/**
 * Recreates the old site's quiet section rail with functional article anchors.
 *
 * @param props - Current article and repository identity.
 * @returns Section links that follow the reading position, hidden on narrower screens.
 */
export function PageContents(props: ContentsProps): ReactElement {
    const { page, projectName } = props;
    const headings = useMemo(
        function contents() {
            return page === null
                ? [{ id: "overview", title: "Overview", depth: firstSectionDepth }]
                : articleHeadings(page.html);
        },
        [page],
    );
    const rail = useRef<HTMLElement>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    useEffect(
        function followReadingPosition() {
            const container = rail.current?.closest("main") ?? null;
            if (container === null) {
                return undefined;
            }
            const main = container;
            const elements = headings.flatMap(function findHeading(heading) {
                const element = document.getElementById(heading.id);
                return element !== null && main.contains(element) ? [element] : [];
            });
            let frame: number | null = null;
            /** Selects the last heading at the reading edge, including short final sections. */
            function update(): void {
                frame = null;
                const top = main.getBoundingClientRect().top + main.clientTop;
                let current = elements[0]?.id ?? null;
                for (const element of elements) {
                    const margin = Number.parseFloat(window.getComputedStyle(element).scrollMarginTop);
                    const offset = Number.isFinite(margin) ? margin : 0;
                    if (element.getBoundingClientRect().top > top + offset + 1) {
                        break;
                    }
                    current = element.id;
                }
                if (
                    main.scrollHeight > main.clientHeight &&
                    main.scrollTop + main.clientHeight >= main.scrollHeight - 1
                ) {
                    current = elements[elements.length - 1]?.id ?? null;
                }
                setActiveId(current);
            }
            /** Coalesces scroll, anchor, and layout updates into one measurement per frame. */
            function schedule(): void {
                frame ??= window.requestAnimationFrame(update);
            }
            main.addEventListener("scroll", schedule, { passive: true });
            window.addEventListener("hashchange", schedule);
            window.addEventListener("resize", schedule);
            const observer = new ResizeObserver(schedule);
            observer.observe(main);
            const article = main.querySelector("article") ?? main.firstElementChild;
            if (article !== null) {
                observer.observe(article);
            }
            update();
            /** Releases observers and pending measurements when the document changes. */
            return function cleanup(): void {
                main.removeEventListener("scroll", schedule);
                window.removeEventListener("hashchange", schedule);
                window.removeEventListener("resize", schedule);
                observer.disconnect();
                if (frame !== null) {
                    window.cancelAnimationFrame(frame);
                }
            };
        },
        [headings],
    );
    const links = headings.map(function section(heading) {
        const indent = heading.depth > firstSectionDepth ? "pl-3" : "";
        return (
            <a
                key={heading.id}
                href={`#${encodeURIComponent(heading.id)}`}
                aria-current={heading.id === activeId ? "location" : undefined}
                className={`mt-4 block text-[11px] leading-relaxed text-muted no-underline hover:text-ink hover:underline aria-[current=location]:font-semibold aria-[current=location]:text-ink aria-[current=location]:underline ${indent}`}
            >
                {heading.title}
            </a>
        );
    });
    return (
        <aside
            ref={rail}
            className="sticky top-6 mt-20 max-h-[calc(100dvh-240px)] self-start overflow-auto border-l border-line px-5 py-8 max-contents:hidden"
        >
            <nav aria-label="On this page">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">[ On this page ]</p>
                {links}
                {headings.length === 0 && <p className="mt-4 text-[11px] text-muted">No sections on this page.</p>}
            </nav>
            <div className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-muted">
                <p>{projectName ?? "Documentation"}</p>
                <p>{page?.title ?? "Documentation overview"}</p>
            </div>
        </aside>
    );
}
