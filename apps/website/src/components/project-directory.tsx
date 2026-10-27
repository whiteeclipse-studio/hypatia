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
            <li key={source.name} className="mt-2">
                <a href={pageUrl(source.name)} className="hover:underline">
                    {source.name}
                </a>
                <span className="ml-3 text-[11px] text-muted">{project.manifest.pages.length} documents</span>
            </li>
        );
    });
    return (
        <div className="mx-auto max-w-[760px] px-12 pt-8 pb-6 max-contents:px-8 max-desktop:px-5 max-desktop:py-6">
            <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap gap-3 text-[11px] text-muted max-desktop:mb-7">
                <a href="/" className="hover:underline">
                    White Eclipse
                </a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{notFound ? "Page not found" : "Overview"}</span>
            </nav>
            <Text as="p" className="mb-4 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                [ Documentation ]
            </Text>
            <Heading as="h1" className="text-[clamp(36px,4vw,56px)] leading-[1.08] font-medium tracking-[-0.045em]">
                {notFound ? "Page not found." : "Project documentation."}
            </Heading>
            <Text as="p" size="4" color="gray" className="mt-5 max-w-[500px] leading-[1.65]">
                {notFound
                    ? "This document is not part of the current build. Choose a project to keep reading."
                    : "Engineering knowledge, in one place."}
            </Text>
            <section id="overview" aria-labelledby="overview-title" className="mt-9 scroll-mt-6">
                <Heading as="h2" size="5" id="overview-title">
                    {notFound ? "Available projects" : "Overview"}
                </Heading>
                <p className="mt-4 text-sm leading-[1.85] text-muted">
                    Choose a project or a document from the navigation to start reading.
                </p>
                <ul className="mt-4 list-disc pl-6">{links}</ul>
            </section>
            {projects.length === 0 && <p>No documentation projects are configured.</p>}
            <div className="mt-10 border-t border-line pt-5 text-right text-sm text-muted">
                <a href="#document" className="hover:underline">
                    Back to top ↑
                </a>
            </div>
        </div>
    );
}
