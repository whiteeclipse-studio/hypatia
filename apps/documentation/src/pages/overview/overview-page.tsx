/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Heading, Link, Text } from "@whiteeclipse/core-ui";
import styles from "./overview-page.module.css";
import type { DocumentationRepository } from "../../content/types";

/**
 * Links to every configured source's independently generated documentation.
 *
 * @param props - Published source inventory.
 * @param props.repositories - Sources with their own documentation landing routes.
 * @returns An overview with working repository links.
 */
export function OverviewPage({ repositories }: { repositories: readonly DocumentationRepository[] }): ReactElement {
    const { t } = useTranslation("interface");
    const links = repositories.map(repository => (
        <li key={repository.name}>
            <Link href={repository.route}>{repository.title}</Link>
        </li>
    ));
    return (
        <article className={styles["article"]} aria-labelledby="documentation-title">
            <nav aria-label={t("navigation.breadcrumb")} className={styles["breadcrumb"]}>
                <Link href="/">White Eclipse</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{t("overview.title")}</span>
            </nav>
            <div className={styles["metadata"]}>
                <Text className={styles["eyebrow"]}>[ {t("brand.documentation")} ]</Text>
                <Badge variant="outline" color="gray">
                    {t("overview.preview")}
                </Badge>
            </div>
            <Heading as="h1" id="documentation-title" className={styles["title"]}>
                {t("overview.heading")}
            </Heading>
            <Text as="p" size="4" color="gray" className={styles["lead"]}>
                {t("brand.tagline")}
            </Text>
            <section id="overview" className={styles["section"]} aria-labelledby="overview-title">
                <Heading as="h2" size="5" id="overview-title">
                    {t("overview.title")}
                </Heading>
                <Text as="p" color="gray">
                    {t("overview.pending")}
                </Text>
                <ul>{links}</ul>
            </section>
            <div className={styles["footer"]}>
                <Link href="#documentation-title" size="2">
                    {t("navigation.backToTop")} <span aria-hidden="true">↑</span>
                </Link>
            </div>
        </article>
    );
}
