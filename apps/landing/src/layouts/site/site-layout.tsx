/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import type { PropsWithChildren, ReactElement } from "react";
import { Separator } from "@whiteeclipse/core-ui";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import styles from "./site-layout.module.css";

/**
 * Arranges navigation, main content, and footer within the shared site shell.
 *
 * @param props - Page content placed in the main landmark.
 * @param props.children - Page sections rendered inside the main landmark.
 * @returns The site layout with a keyboard skip link.
 */
export function SiteLayout({ children }: PropsWithChildren): ReactElement {
    const { t } = useTranslation("interface");
    return (
        <div className={styles["surface"]}>
            <a className={styles["skipLink"]} href="#landing-main">
                {t("accessibility.skipToContent")}
            </a>
            <div className={styles["page"]}>
                <SiteHeader />
                <Separator size="4" />
                <main id="landing-main" tabIndex={-1}>
                    {children}
                </main>
                <Separator size="4" />
                <SiteFooter />
            </div>
        </div>
    );
}
