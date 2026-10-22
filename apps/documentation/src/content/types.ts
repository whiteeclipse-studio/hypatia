/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Public identity of an English document or one of its mirrored translations. */
export interface DocumentSummary {
    repository: string;
    repositoryTitle: string;
    id: string;
    sourcePath: string;
    canonicalPath: string;
    language: string;
    route: string;
    title: string;
    sourceReference?: string;
}

/** Public repository identity used by source selection without exposing server paths. */
export interface DocumentationRepository {
    name: string;
    title: string;
    route: string;
}

/** Sanitized heading identity shared by article fragments and the contents rail. */
export interface DocumentHeading {
    id: string;
    title: string;
    depth: number;
}

/** Application-sanitized article HTML; Markdown never supplies executable components. */
export interface DocumentArticle extends DocumentSummary {
    html: string;
    headings: DocumentHeading[];
}

/** Serializable snapshot used for SSR, SSG, and initial browser hydration. */
export interface DocumentationPage {
    base: string;
    route: string;
    repositories: DocumentationRepository[];
    documents: DocumentSummary[];
    article: DocumentArticle | null;
}

/** All converted pages retained by the build-time renderer, without source Markdown. */
export interface DocumentationPublication {
    base: string;
    repositories: DocumentationRepository[];
    documents: DocumentSummary[];
    articles: DocumentArticle[];
}
