/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { PropsWithChildren, ReactElement } from "react";
import { Heading } from "@whiteeclipse/core-ui";
import styles from "./section-heading.module.css";

/** Accessible identifier and text for a repeated section heading. */
interface SectionHeadingProps extends PropsWithChildren {
    id: string;
}

/**
 * Applies the shared section title treatment while preserving heading semantics.
 *
 * @param props - Heading text and the section's accessible label target.
 * @param props.id - Heading identifier.
 * @param props.children - Heading content.
 * @returns A styled second-level heading.
 */
export function SectionHeading({ id, children }: SectionHeadingProps): ReactElement {
    return (
        <Heading as="h2" id={id} className={styles["heading"]}>
            {children}
        </Heading>
    );
}
