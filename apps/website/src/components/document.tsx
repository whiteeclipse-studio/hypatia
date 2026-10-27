/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import type { RenderedPage } from "@whiteeclipse/documentation-builder/browser";
import { Disclosure } from "./disclosure.tsx";
import article from "../styles/article.module.css";
import { pageUrl } from "../routes.ts";

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
    const metadata = project.manifest.pages.find(function current(candidate): boolean {
        return candidate.id === page.id;
    });
    const directories = metadata === undefined ? [page.title] : metadata.sourcePath.split("/");
    const filename = directories.pop() ?? page.title;
    const ancestors = directories.map(function directory(label, index) {
        const path = `${directories.slice(0, index + 1).join("/")}/index.html`;
        const published = project.manifest.pages.some(function folder(candidate): boolean {
            return candidate.path === path;
        });
        return { label, key: path, href: published ? pageUrl(source.name, path) : undefined };
    });
    const breadcrumbs = [
        { label: source.name, key: "project", href: pageUrl(source.name) },
        ...ancestors,
        { label: filename, key: "current", href: undefined },
    ].map(function breadcrumb(entry, index, entries) {
        return (
            <li key={entry.key} className="flex min-w-0 items-center gap-3 wrap-anywhere">
                {index > 0 && <span aria-hidden="true">/</span>}
                {entry.href === undefined ? (
                    <span aria-current={index === entries.length - 1 ? "page" : undefined}>{entry.label}</span>
                ) : (
                    <a href={entry.href} className="hover:underline">
                        {entry.label}
                    </a>
                )}
            </li>
        );
    });
    return (
        <div className="mx-auto max-w-[900px] px-12 pt-8 pb-12 max-contents:px-8 max-desktop:px-5 max-desktop:py-6">
            <div className="pointer-events-none sticky top-6 z-1 flex h-0 justify-end">
                <div className="pointer-events-auto self-start bg-surface">
                    <Disclosure
                        label={`r.${page.revision}`}
                        accessibleLabel={`Document revision ${page.revision}`}
                        title="Revision history"
                        html={page.revisions}
                    />
                </div>
            </div>
            <nav aria-label="Breadcrumb" className="mb-8 pr-20 text-xs leading-relaxed text-muted">
                <ol className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-1 p-0">{breadcrumbs}</ol>
            </nav>
            <article
                className={article["article"]}
                aria-label={page.title}
                dangerouslySetInnerHTML={{ __html: page.html }}
            />
            <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-xs text-muted">
                <Disclosure
                    label="©"
                    accessibleLabel="Copyright and licence"
                    title="Copyright and licence"
                    html={page.copyrightAndLicence}
                />
                <a href={project.artifactUrl} download className="hover:underline">
                    Download artifact
                </a>
                <a href="#document" className="hover:underline">
                    Back to top ↑
                </a>
            </footer>
        </div>
    );
}
