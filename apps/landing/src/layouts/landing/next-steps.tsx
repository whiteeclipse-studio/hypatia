/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";
import { Text } from "@whiteeclipse/core-ui";
import { Artwork } from "../../components/artwork/artwork";
import { UnavailableAction } from "../../components/action/action";
import { SectionLabel } from "../../components/section-label/section-label";
import { SectionHeading } from "../../components/section-heading/section-heading";
import styles from "./next-steps.module.css";

/**
 * Displays the illustrative blog introduction with an unavailable destination.
 *
 * @returns The illustrative blog section.
 */
function BlogSection(): ReactElement {
    const { t } = useTranslation("interface");
    const { t: page } = useTranslation("landing");
    return (
        <section id="landing-blog" className={styles["section"]} aria-labelledby="landing-blog-title">
            <SectionLabel>{page("blog.label")}</SectionLabel>
            <SectionHeading id="landing-blog-title">{page("blog.title")}</SectionHeading>
            <Text as="p" size="4" color="gray">
                {page("blog.description")}
            </Text>
            <UnavailableAction outlined tooltip={t("placeholders.blog")}>
                {t("actions.readBlog")}
            </UnavailableAction>
        </section>
    );
}

/**
 * Preserves the mockup's contact invitation and decorative cropped portfolio artwork.
 *
 * @returns The illustrative contact section.
 */
function ContactSection(): ReactElement {
    const { t } = useTranslation("interface");
    const { t: page } = useTranslation("landing");
    return (
        <section id="landing-contact" className={styles["section"]} aria-labelledby="landing-contact-title">
            <SectionLabel>{page("contact.label")}</SectionLabel>
            <SectionHeading id="landing-contact-title">
                {page("contact.titleFirst")}
                <br />
                {page("contact.titleSecond")}
            </SectionHeading>
            <Text as="p" size="4" color="gray">
                {page("contact.description")}
            </Text>
            <UnavailableAction tooltip={t("placeholders.contact")}>{t("actions.getInTouch")}</UnavailableAction>
            <Artwork source="/assets/orbital-placeholder.png" className={styles["footerArt"]} />
        </section>
    );
}

/**
 * Composes the lower-page destinations while retaining their explicit placeholder state.
 *
 * @returns The lower-page section arrangement.
 */
export function NextSteps(): ReactElement {
    return (
        <div className={styles["nextSteps"]}>
            <BlogSection />
            <ContactSection />
        </div>
    );
}
