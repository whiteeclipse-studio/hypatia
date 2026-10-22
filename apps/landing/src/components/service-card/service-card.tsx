/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Heading, Text } from "@whiteeclipse/core-ui";
import styles from "./service-card.module.css";

/** Content of one service summary, independent of the page's service collection. */
export interface ServiceCardProps {
    title: string;
    description: string;
    icon: IconDefinition;
}

/**
 * Presents one service without deciding its placement in a collection.
 *
 * @param props - Service title, description, and decorative icon.
 * @param props.title - Service name.
 * @param props.description - Service summary.
 * @param props.icon - Decorative service icon.
 * @returns An article describing the service.
 */
export function ServiceCard({ title, description, icon }: ServiceCardProps): ReactElement {
    return (
        <article className={styles["service"]}>
            <FontAwesomeIcon icon={icon} className={styles["icon"]} aria-hidden="true" />
            <Heading as="h3" size="4" weight="medium">
                {title}
            </Heading>
            <Text as="p" size="3" color="gray">
                {description}
            </Text>
        </article>
    );
}
