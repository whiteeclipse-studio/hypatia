/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@whiteeclipse/core-ui";
import { LandingAction } from "../../components/action/action";
import { SectionHeading } from "../../components/section-heading/section-heading";
import { SectionLabel } from "../../components/section-label/section-label";
import styles from "./documentation.module.css";

/**
 * Connects the landing page to the published project documentation through a normal, server-rendered link.
 *
 * @returns A localized documentation introduction and navigation action.
 */
export function Documentation(): ReactElement {
    const { t } = useTranslation("landing");
    return (
        <section id="landing-documentation" className={styles["section"]} aria-labelledby="landing-documentation-title">
            <div className={styles["heading"]}>
                <SectionLabel>{t("documentation.label")}</SectionLabel>
                <SectionHeading id="landing-documentation-title">{t("documentation.title")}</SectionHeading>
            </div>
            <div className={styles["copy"]}>
                <Text as="p" size="4" color="gray">
                    {t("documentation.description")}
                </Text>
                <LandingAction href="/docs/">{t("documentation.action")}</LandingAction>
            </div>
        </section>
    );
}
