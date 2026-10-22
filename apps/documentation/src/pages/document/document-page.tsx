/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { Heading, Link, Text } from "@whiteeclipse/core-ui";
import { useTranslation } from "react-i18next";
import type { DocumentArticle, DocumentSummary } from "../../content/types";
import { documentVariants } from "../../content/localization";
import styles from "./document-page.module.css";
import { createBreadcrumbs } from "./breadcrumbs";

/** Sanitized article and its English/translated source identities. */
interface DocumentPageProps {
    article: DocumentArticle;
    documents: readonly DocumentSummary[];
}

/**
 * Presents converted Markdown in the reading shell with explicit source and language navigation.
 *
 * @param props - Current sanitized article and publication inventory.
 * @param props.article - Application-sanitized HTML and metadata.
 * @param props.documents - Index used to identify translations of this document.
 * @returns The article, source breadcrumb, and all available authored language variants.
 */
export function DocumentPage({ article, documents }: DocumentPageProps): ReactElement {
    const { t } = useTranslation("interface");
    const variants = documentVariants(documents, article.canonicalPath, article.repository);
    const breadcrumbs = createBreadcrumbs(article, documents).map((entry, index, entries) => (
        <span key={index} className={styles["crumb"]}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {entry.href === undefined ? (
                <span aria-current={index === entries.length - 1 ? "page" : undefined}>{entry.label}</span>
            ) : (
                <Link href={entry.href}>{entry.label}</Link>
            )}
        </span>
    ));
    const languages = variants.map(document => (
        <Link
            key={document.route}
            href={document.route}
            hrefLang={document.language}
            lang={document.language}
            aria-current={document.route === article.route ? "page" : undefined}
        >
            {new Intl.DisplayNames([document.language], { type: "language" }).of(document.language) ??
                document.language}
        </Link>
    ));
    const hasTitle = article.headings.some(heading => heading.depth === 1);

    return (
        <article className={styles["article"]} lang={article.language}>
            <nav aria-label={t("navigation.breadcrumb")} className={styles["breadcrumb"]}>
                {breadcrumbs}
            </nav>
            <nav className={styles["languages"]} aria-label={t("content.languages")}>
                {languages}
            </nav>
            {article.language !== "en" && (
                <Text as="p" size="2" color="gray">
                    {t("content.translation")}
                </Text>
            )}
            {article.sourceReference !== undefined && (
                <Text as="p" size="1" className={styles["reference"]}>
                    {article.sourceReference}
                </Text>
            )}
            {!hasTitle && <Heading as="h1">{article.title}</Heading>}
            <div className={styles["markdown"]} dangerouslySetInnerHTML={{ __html: article.html }} />
        </article>
    );
}
