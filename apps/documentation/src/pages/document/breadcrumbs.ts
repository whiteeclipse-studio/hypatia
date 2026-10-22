/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { DocumentArticle, DocumentSummary } from "../../content/types";
import { documentVariants, selectTranslation } from "../../content/localization";

/** One directory in the canonical hierarchy or the current document filename. */
export interface DocumentBreadcrumb {
    label: string;
    href?: string;
}

/**
 * Links each canonical ancestor to its published README in the article's language, with English fallback.
 *
 * @param article - Current document and source repository.
 * @param documents - Complete publication inventory.
 * @returns Root, ancestor directories, and the non-linked current filename.
 */
export function createBreadcrumbs(
    article: DocumentArticle,
    documents: readonly DocumentSummary[],
): DocumentBreadcrumb[] {
    const parts = article.canonicalPath.split("/");
    const filenameIndex = parts.length - 1;
    const labels = [article.repositoryTitle, ...parts.slice(0, filenameIndex)];
    const entries = labels.map((label, index) => {
        const prefix = parts.slice(0, index).join("/");
        const path = prefix === "" ? "README.md" : `${prefix}/README.md`;
        const readme = selectTranslation(documentVariants(documents, path, article.repository), article.language);
        return { label, ...(readme === undefined ? {} : { href: readme.route }) };
    });
    return [...entries, { label: parts[filenameIndex] ?? article.title }];
}
