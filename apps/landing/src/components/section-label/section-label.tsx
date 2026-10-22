/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement, PropsWithChildren } from "react";
import { Text } from "@whiteeclipse/core-ui";
import styles from "./section-label.module.css";

/**
 * Displays the mockup's monospace section annotations without adding a heading level.
 *
 * @param props - Section annotation content.
 * @param props.children - Annotation text.
 * @returns The styled annotation.
 */
export function SectionLabel({ children }: PropsWithChildren): ReactElement {
    return (
        <Text as="p" className={styles["eyebrow"]}>
            {children}
        </Text>
    );
}
