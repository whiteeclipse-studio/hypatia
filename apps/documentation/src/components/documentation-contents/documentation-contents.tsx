/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Link, Text } from "@whiteeclipse/core-ui";
import styles from "./documentation-contents.module.css";
import type { DocumentArticle } from "../../content/types";

/** Sanitized current article, or the site overview. */
interface DocumentationContentsProps {
    article: DocumentArticle | null;
}

/**
 * Provides section links using the article's actual sanitized heading IDs.
 *
 * @param props - Current article context.
 * @param props.article - Article containing the final heading identities.
 * @returns The local table of contents and current project identity.
 */
export function DocumentationContents({ article }: DocumentationContentsProps): ReactElement {
    const { t } = useTranslation("interface");
    const headings =
        article === null
            ? [{ id: "overview", title: t("overview.title"), depth: 2 }]
            : article.headings.filter(heading => heading.depth > 1);
    const links = headings.map(heading => (
        <Link key={heading.id} href={`#${heading.id}`}>
            {heading.title}
        </Link>
    ));
    return (
        <nav className={styles["contents"]} aria-label={t("navigation.onThisPage")}>
            <Text as="p" className={styles["eyebrow"]}>
                [ {t("navigation.onThisPage")} ]
            </Text>
            {links}
            <div className={styles["note"]}>
                <Text as="p" size="1" color="gray">
                    {article?.repositoryTitle ?? t("brand.documentation")}
                </Text>
                <Text as="p" size="1" color="gray">
                    {article?.title ?? t("overview.description")}
                </Text>
            </div>
        </nav>
    );
}
