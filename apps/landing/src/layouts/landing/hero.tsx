/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";
import { Heading, Link, Text } from "@whiteeclipse/core-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Artwork } from "../../components/artwork/artwork";
import { LandingAction } from "../../components/action/action";
import { SectionLabel } from "../../components/section-label/section-label";
import styles from "./hero.module.css";

/**
 * Introduces the studio's work beside the mockup's reserved orbital portfolio artwork.
 *
 * @returns The introductory portfolio section.
 */
export function Hero(): ReactElement {
    const { t } = useTranslation("interface");
    const { t: page } = useTranslation("landing");
    return (
        <section className={styles["hero"]} aria-labelledby="landing-title">
            <div className={styles["copy"]}>
                <SectionLabel>{page("hero.label")}</SectionLabel>
                <Heading as="h1" id="landing-title" className={styles["title"]}>
                    {page("hero.titleFirst")}
                    <br />
                    {page("hero.titleSecond")}
                </Heading>
                <Text as="p" size="5" color="gray" className={styles["description"]}>
                    {page("hero.description")}
                </Text>
                <LandingAction href="#landing-portfolio">{t("actions.explorePortfolio")}</LandingAction>
                <Link href="#landing-studio" size="2" underline="always" className={styles["studioLink"]}>
                    {t("actions.meetStudio")}
                    <FontAwesomeIcon icon={faArrowDown} aria-hidden="true" />
                </Link>
            </div>
            <div id="landing-portfolio" className={styles["portfolio"]} tabIndex={-1}>
                <SectionLabel>{page("hero.portfolioLabel")}</SectionLabel>
                <Artwork source="/assets/orbital-placeholder.png" className={styles["orbits"]} />
            </div>
        </section>
    );
}
