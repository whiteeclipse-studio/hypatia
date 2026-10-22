/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { Brand } from "../../components/brand/brand";
import { LanguageOptions } from "../../components/language-options/language-options";
import styles from "./site-header.module.css";

/**
 * Connects the main navigation to the mockup's sections on this page.
 *
 * @returns The site header and navigation.
 */
export function SiteHeader(): ReactElement {
    return (
        <header className={styles["header"]}>
            <Brand className={styles["brand"]} />
            <LanguageOptions />
        </header>
    );
}
