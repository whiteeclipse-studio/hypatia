/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { Text, WhiteEclipseBrand } from "@whiteeclipse/core-ui";
import { useTranslation } from "react-i18next";
import styles from "./documentation-header.module.css";

/**
 * Pairs the theme-aware studio identity with the documentation site name.
 *
 * @returns The branded header and link to the documentation home page.
 */
export function DocumentationHeader(): ReactElement {
    const { t } = useTranslation("interface");

    return (
        <header className={styles["header"]}>
            <div className={styles["identity"]}>
                <a className={styles["brand"]} href="https://whiteeclipse.fr/" aria-label={t("brand.home")}>
                    <WhiteEclipseBrand />
                </a>
                <span className={styles["divider"]} aria-hidden="true">
                    /
                </span>
                <Text color="gray">{t("brand.documentation")}</Text>
            </div>
            <Text size="1" color="gray" className={styles["tagline"]}>
                {t("brand.tagline")}
            </Text>
        </header>
    );
}
