/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Heading, Text } from "@radix-ui/themes";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import { pageUrl } from "../routes.ts";

/** Directory inputs shared by the home and missing-page views. */
interface DirectoryProps {
    projects: DocumentationProject[];
    notFound: boolean;
}

/**
 * Offers real configured projects and a recovery path for unknown routes.
 *
 * @param props - Available project snapshots and route status.
 * @param props.projects - Available validated projects.
 * @param props.notFound - Whether this route is unavailable.
 * @returns The documentation directory or a helpful missing-page view.
 */
export function ProjectDirectory({ projects, notFound }: DirectoryProps): ReactElement {
    const links = projects.map(function projectLink(project) {
        const source = project.manifest.source;
        return (
            <a
                className="grid gap-(--space-3) border-y border-(--gray-7) bg-panel p-(--space-5) no-underline hover:bg-hover"
                key={source.name}
                href={pageUrl(source.name)}
            >
                <strong className="font-brand text-project font-medium">
                    {source.name}
                    <span aria-hidden="true" className="float-right">
                        {" "}
                        ↗
                    </span>
                </strong>
                <span className="text-label text-muted">
                    {project.manifest.pages.length} documents · {source.dirty ? "Working copy" : "Build snapshot"}
                </span>
            </a>
        );
    });
    return (
        <div className="max-w-[980px] px-[clamp(24px,6vw,80px)] py-[clamp(32px,8vw,100px)]">
            <Text
                as="p"
                className="max-w-[48ch] font-code text-note leading-[1.7] tracking-[0.12em] text-muted uppercase"
            >
                White Eclipse / Documentation
            </Text>
            <Heading as="h1" size="9" className="my-(--space-5) max-w-[12ch]">
                {notFound ? "Page not found." : "A place for the details."}
            </Heading>
            <Text as="p" size="4" color="gray" className="max-w-[48ch] leading-[1.7]">
                {notFound
                    ? "This document is not part of the current build. Choose a project to keep reading."
                    : "Explore project guides, technical references, and the decisions behind our work."}
            </Text>
            <div className="mt-(--space-8) grid gap-(--space-4)">{links}</div>
            {projects.length === 0 && <p>No documentation projects are configured.</p>}
        </div>
    );
}
