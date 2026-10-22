/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { PropsWithChildren, ReactElement } from "react";
import { Text } from "@whiteeclipse/core-ui";
import { useTranslation } from "react-i18next";
import { LanguageOptions } from "../../components/language-options/language-options";
import { DocumentationHeader } from "../../components/documentation-header/documentation-header";
import { DocumentationNavigation } from "../../components/documentation-navigation/documentation-navigation";
import { DocumentationContents } from "../../components/documentation-contents/documentation-contents";
import styles from "./documentation-layout.module.css";
import type { DocumentationPage } from "../../content/types";

/** Current article and publication index supplied by runtime conversion or SSG. */
interface DocumentationLayoutProps extends PropsWithChildren {
    page: DocumentationPage;
}

/**
 * Frames the reading area with the exploratory Storybook navigation composition.
 *
 * @param props - Current page content.
 * @param props.children - Article rendered inside the main landmark.
 * @param props.page - Navigation and document snapshot shared with the client.
 * @returns Responsive desktop rails, mobile directory disclosure, and shared site chrome.
 */
export function DocumentationLayout({ children, page }: DocumentationLayoutProps): ReactElement {
    const { t } = useTranslation("interface");
    return (
        <div className={styles["surface"]}>
            <a href="#documentation-content" className={styles["skip"]}>
                {t("accessibility.skipToContent")}
            </a>
            <DocumentationHeader />
            <div className={styles["mobileNavigation"]}>
                <details>
                    <summary>{t("navigation.browse")}</summary>
                    <DocumentationNavigation page={page} />
                </details>
            </div>
            <div className={styles["layout"]}>
                <div className={styles["desktopNavigation"]}>
                    <DocumentationNavigation page={page} />
                </div>
                <main id="documentation-content" tabIndex={-1}>
                    {children}
                </main>
                <DocumentationContents article={page.article} />
            </div>
            <footer className={styles["footer"]}>
                <Text size="1" color="gray" className={styles["text"]}>
                    Copyright © 2026 White Eclipse MIT License
                </Text>
                <LanguageOptions page={page} />
            </footer>
        </div>
    );
}
