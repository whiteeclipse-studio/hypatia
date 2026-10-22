/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement, PropsWithChildren } from "react";
import { Button, Tooltip } from "@whiteeclipse/core-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./action.module.css";

/** Destination for a working local navigation action. */
interface LandingActionProps extends PropsWithChildren {
    href: string;
}

/** Appearance of a disabled action whose destination remains a mockup placeholder. */
interface UnavailableActionProps extends PropsWithChildren {
    outlined?: boolean;
    tooltip: string;
}

/**
 * Presents a local link using the mockup's animated corner-frame treatment.
 *
 * @param props - Destination and link content.
 * @param props.href - Local navigation destination.
 * @param props.children - Action label.
 * @returns The styled navigation link.
 */
export function LandingAction({ href, children }: LandingActionProps): ReactElement {
    return (
        <Button asChild size="4" variant="solid" className={`${styles["corners"]} ${styles["portfolio"]}`}>
            <a href={href}>
                {children}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </a>
        </Button>
    );
}

/**
 * Explains an unavailable destination on hover or focus while keeping its action inert.
 *
 * @param props - Disabled action appearance and label.
 * @param props.children - Action label.
 * @param props.outlined - Whether the unavailable action is outlined.
 * @param props.tooltip - Localized explanation of the unavailable destination.
 * @returns The disabled placeholder action.
 */
export function UnavailableAction({ outlined = false, tooltip, children }: UnavailableActionProps): ReactElement {
    const variant = outlined ? "outline" : "solid";
    const className = outlined ? styles["unavailable"] : `${styles["unavailable"]} ${styles["corners"]}`;

    return (
        <Tooltip content={tooltip} side="top">
            <Button
                type="button"
                size="4"
                variant={variant}
                className={className}
                aria-disabled="true"
                data-disabled
                onClick={event => {
                    event.preventDefault();
                }}
            >
                {children}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Button>
        </Tooltip>
    );
}
