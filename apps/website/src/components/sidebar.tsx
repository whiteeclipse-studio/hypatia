/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useEffect, useRef, type ReactElement } from "react";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import { Navigation } from "./navigation.tsx";
import { ProjectSwitcher } from "./project-switcher.tsx";

/** Project selection, manifest navigation, and snapshot context for the sidebar. */
interface SidebarProps {
    projects: DocumentationProject[];
    project: DocumentationProject | undefined;
    activeId: string;
}

/**
 * Provides independently scrolling navigation and a native mobile disclosure.
 *
 * @param props - Configured projects and active document.
 * @returns The project navigation pane.
 */
export function Sidebar(props: SidebarProps): ReactElement {
    const { projects, project, activeId } = props;
    const source = project?.manifest.source;
    const sidebar = useRef<HTMLDetailsElement>(null);
    useEffect(function restoreDesktopNavigation() {
        const desktop = window.matchMedia("(min-width: 761px)");
        /** Reopens navigation when returning from a collapsed mobile layout. */
        function reopen(): void {
            if (desktop.matches && sidebar.current !== null) {
                sidebar.current.open = true;
            }
        }
        desktop.addEventListener("change", reopen);
        /** Removes the viewport listener when the sidebar unmounts. */
        return function cleanup(): void {
            desktop.removeEventListener("change", reopen);
        };
    }, []);
    return (
        <details
            ref={sidebar}
            className="group flex h-full min-h-0 flex-col border-r border-line bg-panel max-desktop:h-auto max-desktop:max-h-[38dvh] max-desktop:shrink-0 max-desktop:overflow-auto max-desktop:border-r-0 max-desktop:border-b"
            open
        >
            <summary className="hidden px-(--space-4) py-(--space-3) text-label before:content-['+_'] group-open:before:content-['−_'] max-desktop:block">
                Browse documentation
            </summary>
            <div className="flex h-full min-h-0 flex-col max-desktop:h-auto">
                <div className="grid gap-(--space-3) p-(--space-5) max-desktop:px-(--space-4) max-desktop:py-(--space-3)">
                    <span className="font-code text-note tracking-[0.12em] text-muted uppercase">Project</span>
                    <ProjectSwitcher projects={projects} current={source?.name ?? null} />
                </div>
                <div className="min-h-0 flex-1 overflow-auto px-(--space-4) pb-(--space-4) [scrollbar-gutter:stable] max-desktop:flex-auto max-desktop:overflow-visible">
                    {project === undefined ? (
                        <p className="m-(--space-2) text-label text-muted">
                            Choose a project to browse its documentation.
                        </p>
                    ) : (
                        <Navigation manifest={project.manifest} activeId={activeId} />
                    )}
                </div>
                {source !== undefined && (
                    <div className="grid gap-(--space-2) border-t border-line px-(--space-5) py-(--space-4) text-note text-muted max-desktop:hidden">
                        <span>Build snapshot{source.dirty ? " · Working copy" : ""}</span>
                        <a href={source.repository}>Source repository ↗</a>
                        <code title={source.commit} className="block truncate font-code">
                            {source.commit}
                        </code>
                    </div>
                )}
                <a
                    className="block border-t border-line px-(--space-5) py-(--space-4) text-label no-underline max-desktop:hidden"
                    href="/"
                >
                    All projects ↗
                </a>
            </div>
        </details>
    );
}
