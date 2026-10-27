/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Theme } from "@radix-ui/themes";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import type { WebsitePage } from "./routes.ts";
import { Document } from "./components/document.tsx";
import { ProjectDirectory } from "./components/project-directory.tsx";
import { Sidebar } from "./components/sidebar.tsx";
import { SiteHeader } from "./components/site-header.tsx";
import { PageContents } from "./components/page-contents.tsx";
import { useAppearance } from "./use-appearance.ts";

/** Static and hydrated application inputs use identical builder snapshots. */
interface AppProps {
    projects: DocumentationProject[];
    state: WebsitePage;
}

/**
 * Composes shared Core UI foundations into an independently scrolling documentation reader.
 *
 * @param props - Validated project catalog and loaded route.
 * @param props.projects - Available validated projects.
 * @param props.state - Loaded route state.
 * @returns The website shell, navigation, and document or project directory.
 */
export function App({ projects, state }: AppProps): ReactElement {
    const { appearance, toggle } = useAppearance();
    const project = projects.find(function current(candidate): boolean {
        return candidate.manifest.source.name === state.projectName;
    });
    return (
        <Theme appearance={appearance} grayColor="sand" accentColor="gray" radius="none">
            <div className="core-ui-background flex h-dvh flex-col overflow-hidden text-ink">
                <a
                    className="fixed -top-25 left-(--space-5) z-10 bg-surface p-(--space-3)"
                    href="#document"
                >
                    Skip to content
                </a>
                <SiteHeader appearance={appearance} toggle={toggle} />
                <div className="mx-auto grid min-h-0 w-full flex-1 grid-cols-[350px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden max-contents:grid-cols-[260px_minmax(0,1fr)] max-desktop:flex max-desktop:flex-col">
                    <Sidebar projects={projects} project={project} activeId={state.page?.id ?? ""} />
                    <main
                        id="document"
                        className="min-h-0 min-w-0 overflow-auto scroll-smooth scrollbar-gutter-stable motion-reduce:scroll-auto max-desktop:flex-1"
                        tabIndex={-1}
                    >
                        <div className="grid min-h-full grid-cols-[minmax(0,1fr)_208px] max-contents:block">
                            <div className="min-w-0">
                                {project !== undefined && state.page !== null ? (
                                    <Document project={project} page={state.page} />
                                ) : (
                                    <ProjectDirectory projects={projects} notFound={state.notFound} />
                                )}
                            </div>
                            <PageContents page={state.page} projectName={state.projectName} />
                        </div>
                    </main>
                </div>
                <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-9 py-4 text-xs text-muted max-desktop:px-5 max-desktop:py-3">
                    <span>
                        Copyright © 2026 White Eclipse ·{" "}
                        <a href="https://whiteeclipse.dev/LICENCE" className="hover:underline">
                            MIT License
                        </a>
                    </span>
                    <a href="/" className="hover:underline">
                        Documentation overview ↗
                    </a>
                </footer>
            </div>
        </Theme>
    );
}
