/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Button, Theme } from "@radix-ui/themes";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import type { WebsitePage } from "./routes.ts";
import { Document } from "./components/document.tsx";
import { ProjectDirectory } from "./components/project-directory.tsx";
import { Sidebar } from "./components/sidebar.tsx";
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
                    className="fixed -top-[100px] left-(--space-5) z-10 bg-surface p-(--space-3) focus:top-(--space-3)"
                    href="#document"
                >
                    Skip to content
                </a>
                <header className="flex h-[76px] shrink-0 items-center gap-(--space-5) border-b border-line px-(--space-6) max-desktop:h-16 max-desktop:gap-(--space-3) max-desktop:px-(--space-4)">
                    <a
                        className="flex items-center gap-(--space-3) whitespace-nowrap font-brand text-[23px] no-underline max-desktop:text-xl"
                        href="/"
                        aria-label="White Eclipse documentation home"
                    >
                        <span className="text-[32px]" aria-hidden="true">
                            ◧
                        </span>{" "}
                        White Eclipse
                    </a>
                    <span className="flex-1 text-label text-muted max-desktop:hidden">Documentation</span>
                    <Button
                        variant="outline"
                        size="1"
                        className="max-desktop:ml-auto"
                        onClick={toggle}
                        aria-label={`Switch to ${appearance === "light" ? "dark" : "light"} appearance`}
                    >
                        {appearance === "light" ? "Dark" : "Light"}
                    </Button>
                </header>
                <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)] max-desktop:flex max-desktop:flex-col">
                    <Sidebar projects={projects} project={project} activeId={state.page?.id ?? ""} />
                    <main
                        id="document"
                        className="min-h-0 min-w-0 overflow-auto scroll-smooth [scrollbar-gutter:stable] motion-reduce:scroll-auto max-desktop:flex-1"
                        tabIndex={-1}
                    >
                        {project !== undefined && state.page !== null ? (
                            <Document project={project} page={state.page} />
                        ) : (
                            <ProjectDirectory projects={projects} notFound={state.notFound} />
                        )}
                    </main>
                </div>
            </div>
        </Theme>
    );
}
