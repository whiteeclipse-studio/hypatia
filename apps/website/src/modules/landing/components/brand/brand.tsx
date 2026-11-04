/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "@whiteeclipse/i18next";
import type { ReactElement } from "react";
import { Text, useThemeContext } from "@radix-ui/themes";
import logoDark from "@whiteeclipse/core-ui/assets/white-eclipse-dark.png";
import logoLight from "@whiteeclipse/core-ui/assets/white-eclipse-light.png";
import styles from "./brand.module.css";


/** Layout and optional consumer-localized description for the studio identity. */
export interface WhiteEclipseBrandProps {
    className?: string | undefined;
    footer?: boolean;
}

/**
 * Displays the supplied theme-aware logo and wordmark with consistent responsive alignment.
 * Consumers provide any link wrapper and translate the optional description.
 *
 * @param props - Brand presentation options.
 * @param props.className - Additional placement class for the containing layout.
 * @param props.footer - Whether to show the localized studio description.
 * @returns The studio identity; its decorative image does not repeat the visible name.
 */
export function Brand({ className = "", footer = false }: WhiteEclipseBrandProps): ReactElement {
    const { t } = useTranslation("landing");
    const description = footer ? t("brand.tagline") : undefined;
    const { appearance } = useThemeContext();
    const logo = appearance === "dark" ? logoDark : logoLight;

    return (
        <div className={`${styles["brand"]} ${className}`}>
            <img src={logo} alt="" className={styles["logo"]} width="64" height="64" />
            <div className={styles["identity"]}>
                <Text as="p" className={styles["wordmark"]}>
                    White Eclipse
                </Text>
                {description !== undefined && (
                    <Text as="p" size="1" color="gray">
                        {description}
                    </Text>
                )}
            </div>
        </div>
    );
}
