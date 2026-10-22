/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";
import { Text, useThemeContext } from "@whiteeclipse/core-ui";
import styles from "./brand.module.css";

/** Options for the repeated wordmark and optional footer description. */
interface BrandProps {
    footer?: boolean;
    className?: string | undefined;
}

/**
 * Chooses the supplied logo for the active theme and pairs it with the brand name.
 *
 * @param props - Footer treatment and optional layout class.
 * @param props.footer - Whether to show the studio description.
 * @param props.className - Placement class supplied by the enclosing layout.
 * @returns The theme-aware studio brand.
 */
export function Brand({ footer = false, className = "" }: BrandProps): ReactElement {
    const { t } = useTranslation("landing");
    const { appearance } = useThemeContext();
    const logo = appearance === "dark" ? "/assets/white-eclipse-dark.png" : "/assets/white-eclipse-light.png";

    return (
        <div className={`${styles["brand"]} ${className}`}>
            <img src={logo} alt="" className={styles["logo"]} width="64" height="64" />
            <div>
                <Text as="p" className={styles["wordmark"]}>
                    {t("brand.name")}
                </Text>
                {footer && (
                    <Text as="p" size="1" color="gray">
                        {t("brand.tagline")}
                    </Text>
                )}
            </div>
        </div>
    );
}
