/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import type { PropsWithChildren, ReactElement } from "react";
import { Separator, Text } from "@whiteeclipse/core-ui";
import { Artwork } from "../../components/artwork/artwork";
import { SectionLabel } from "../../components/section-label/section-label";
import { SectionHeading } from "../../components/section-heading/section-heading";
import styles from "./studio.module.css";

/**
 * Pairs the mockup's studio statement and eclipse illustration with its service summaries.
 *
 * @param props - Service elements composed by the page.
 * @param props.children - Service section placed below the studio introduction.
 * @returns The studio introduction and service grid.
 */
export function Studio({ children }: PropsWithChildren): ReactElement {
    const { t } = useTranslation("landing");
    return (
        <section id="landing-studio" className={styles["studio"]} aria-labelledby="landing-studio-title">
            <SectionLabel>{t("studio.label")}</SectionLabel>
            <div className={styles["intro"]}>
                <div className={styles["statement"]}>
                    <SectionHeading id="landing-studio-title">{t("studio.title")}</SectionHeading>
                    <Artwork source="/assets/eclipse-placeholder.png" className={styles["eclipse"]} />
                </div>
                <div className={styles["copy"]}>
                    <Text as="p" size="5" color="gray">
                        {t("studio.description")}
                    </Text>
                    <Separator size="4" />
                    <SectionLabel>{t("studio.servicesLabel")}</SectionLabel>
                </div>
            </div>
            {children}
        </section>
    );
}
