/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "@whiteeclipse/i18next";
import type { ReactElement } from "react";
import { Link } from "@radix-ui/themes";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Brand } from "../../components/brand/brand";
import { LanguageOptions } from "../../components/language-options/language-options";
import styles from "./site-footer.module.css";


/**
 * Repeats the brand and preserves the mockup's unavailable social destinations.
 *
 * @returns The site footer and placeholder destinations.
 */
export function SiteFooter(): ReactElement {
    const { t } = useTranslation("interface");
    return (
        <footer className={styles["footer"]}>
            <Brand footer className={styles["brand"]} />
            <div className={styles["footerLinks"]} role="group" aria-label={t("accessibility.socialPlaceholders")}>
                <Link size="1" href="https://github.com/whiteeclipse-studio">
                    <GitHubLogoIcon aria-hidden="true" />
                    {t("social.github")}
                </Link>
                <Link size="1" href="https://linkedin.com/company/whiteeclipse">
                    <LinkedInLogoIcon aria-hidden="true" />
                    {t("social.linkedin")}
                </Link>
                <Link href="mailto:contact@whiteeclipse.dev" size="1">
                    {t("navigation.contact")}
                </Link>
            </div>
            <LanguageOptions />
        </footer>
    );
}
