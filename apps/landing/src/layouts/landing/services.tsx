/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { PropsWithChildren, ReactElement } from "react";
import styles from "./services.module.css";

/**
 * Arranges the page's service card elements in a responsive grid.
 *
 * @param props - Service card elements owned by the page.
 * @param props.children - Service cards to arrange.
 * @returns The services grid and its local navigation target.
 */
export function Services({ children }: PropsWithChildren): ReactElement {
    return (
        <div id="landing-services" className={styles["services"]}>
            {children}
        </div>
    );
}
