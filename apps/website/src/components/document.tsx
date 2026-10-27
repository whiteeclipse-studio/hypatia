/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import type { RenderedPage } from "@whiteeclipse/documentation-builder/browser";
import { Disclosure } from "./disclosure.tsx";
import article from "../styles/article.module.css";

/** Validated project and sanitized content for the reading pane. */
interface DocumentProps {
    project: DocumentationProject;
    page: RenderedPage;
}

/**
 * Presents an article and separate document-level revision and copyright controls.
 *
 * @param props - The immutable build-time snapshot and rendered page.
 * @param props.project - Current project snapshot.
 * @param props.page - Sanitized rendered page.
 * @returns A reading surface with metadata outside the article.
 */
export function Document({ project, page }: DocumentProps): ReactElement {
    const source = project.manifest.source;
    return (
        <>
            <div className="sticky top-0 z-1 flex items-center justify-between gap-(--space-4) border-b border-line bg-surface px-(--space-6) py-(--space-3) text-note text-muted max-desktop:px-(--space-4)">
                <span className="truncate">
                    {source.name} <span aria-hidden="true">/</span> {page.title}
                </span>
                <Disclosure label={`Revision ${page.revision}`} title="Revision history" html={page.revisions} />
            </div>
            <div className="mx-auto min-h-[calc(100%-54px)] max-w-[1000px] bg-surface px-[clamp(24px,5vw,72px)] py-(--space-7) max-desktop:pt-(--space-6)">
                <article
                    className={article["article"]}
                    aria-label={page.title}
                    dangerouslySetInnerHTML={{ __html: page.html }}
                />
                <footer className="mt-(--space-9) flex flex-wrap items-center justify-between gap-(--space-4) border-t border-line pt-(--space-5) text-note text-muted">
                    <Disclosure
                        label="© Copyright and licence"
                        title="Copyright and licence"
                        html={page.copyrightAndLicence}
                    />
                    <a href={project.artifactUrl} download>
                        Download artifact
                    </a>
                </footer>
            </div>
        </>
    );
}
