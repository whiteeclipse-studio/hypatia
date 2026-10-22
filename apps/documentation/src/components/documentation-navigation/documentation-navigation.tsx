/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useId, type ReactElement } from "react";
import { Text } from "@whiteeclipse/core-ui";
import { useTranslation } from "react-i18next";
import { createNavigation, type NavigationEntry } from "./navigation";
import type { DocumentationPage } from "../../content/types";
import { NavigationTree } from "./navigation-tree";
import styles from "./documentation-navigation.module.css";

/** Current document and complete publication index for the sidebar. */
interface DocumentationNavigationProps {
    page: DocumentationPage;
}

/**
 * Browses the source hierarchy, choosing translated documents with English fallbacks.
 *
 * @param props - Current navigation snapshot.
 * @param props.page - Current route and published documents.
 * @returns The labelled documentation navigation and repository-loading state.
 */
export function DocumentationNavigation({ page }: DocumentationNavigationProps): ReactElement {
    const { t, i18n } = useTranslation("interface");
    const repositoryId = useId();
    const currentRepository = page.article?.repository ?? page.repositories[0]?.name ?? "";
    const documents = page.documents.filter(document => document.repository === currentRepository);
    const options = page.repositories.map(repository => (
        <option key={repository.name} value={repository.name}>
            {repository.title}
        </option>
    ));
    const navigation: readonly NavigationEntry[] = [
        { kind: "page", label: t("overview.title"), href: page.base, current: page.route === page.base },
        ...createNavigation(documents, i18n.language, page.route),
    ];

    return (
        <nav className={styles["sidebar"]} aria-label={t("navigation.tree")}>
            <Text as="p" className={styles["eyebrow"]}>
                [ {t("navigation.project")} ]
            </Text>
            <label className={styles["project"]} htmlFor={repositoryId}>
                <select
                    id={repositoryId}
                    value={currentRepository}
                    onChange={event => {
                        const target = page.repositories.find(repository => repository.name === event.target.value);
                        if (target !== undefined) {
                            window.location.assign(target.route);
                        }
                    }}
                >
                    {options}
                </select>
            </label>
            <NavigationTree entries={navigation} />
        </nav>
    );
}
