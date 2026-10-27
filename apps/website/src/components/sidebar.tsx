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

const abbreviatedCommitLength = 7;

/**
 * Identifies the documentation snapshot without overwhelming the navigation rail.
 *
 * @param source - Validated source identity.
 * @returns A short commit label with its working-copy status.
 */
function snapshotLabel(source: DocumentationProject["manifest"]["source"]): string {
    return `${source.commit.slice(0, abbreviatedCommitLength)} · ${source.dirty ? "Working copy" : "Build snapshot"}`;
}

/**
 * Provides independently scrolling navigation and a native mobile disclosure.
 *
 * @param props - Configured projects and active document.
 * @returns The project navigation pane.
 */
export function Sidebar(props: SidebarProps): ReactElement {
    const { projects, project, activeId } = props;
    const navigationProject = project ?? projects[0];
    const source = navigationProject?.manifest.source;
    const sidebar = useRef<HTMLDetailsElement>(null);
    useEffect(function restoreDesktopNavigation() {
        const desktop = window.matchMedia("(min-width: 701px)");
        /** Opens the desktop rail and collapses navigation when entering a mobile viewport. */
        function matchViewport(): void {
            if (sidebar.current !== null) {
                sidebar.current.open = desktop.matches;
            }
        }
        matchViewport();
        desktop.addEventListener("change", matchViewport);
        /** Removes the viewport listener when the sidebar unmounts. */
        return function cleanup(): void {
            desktop.removeEventListener("change", matchViewport);
        };
    }, []);
    return (
        <aside className="h-full min-h-0 min-w-0 border-r border-line scrollbar-gutter-stable max-desktop:h-auto max-desktop:shrink-0 max-desktop:border-r-0 max-desktop:border-b">
            <details
                ref={sidebar}
                className="group flex h-full min-h-0 flex-col overflow-hidden open:[&::details-content]:flex max-desktop:h-auto [&::details-content]:min-h-0 [&::details-content]:flex-1 [&::details-content]:flex-col"
                open
            >
                <summary className="hidden shrink-0 px-(--space-4) py-(--space-3) text-label before:content-['+_'] max-desktop:block">
                    Browse documentation
                </summary>
                <div className="grid shrink-0 gap-5 px-6 pt-8 pb-4 max-desktop:px-5 max-desktop:pt-4">
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                        [ Project ]
                    </span>
                    <ProjectSwitcher projects={projects} current={source?.name ?? null} />
                    {source !== undefined && (
                        <p className="text-[10px] text-muted" title={source.commit}>
                            {snapshotLabel(source)}
                        </p>
                    )}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scrollbar-gutter-stable max-desktop:px-5">
                    {navigationProject === undefined ? (
                        <p className="m-(--space-2) text-label text-muted">
                            Choose a project to browse its documentation.
                        </p>
                    ) : (
                        <Navigation manifest={navigationProject.manifest} activeId={activeId} />
                    )}
                </div>
                {source !== undefined && (
                    <div className="mx-6 shrink-0 border-t border-line py-5 text-[11px] text-muted max-desktop:hidden">
                        <a href={source.repository} className="hover:underline">
                            Source repository ↗
                        </a>
                    </div>
                )}
            </details>
        </aside>
    );
}
