import type { PropsWithChildren } from 'react';
import { Button } from '@whiteeclipse/core-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './action.module.css';

/** Destination for a working local navigation action. */
interface LandingActionProps extends PropsWithChildren {
    href: string;
}

/** Appearance of a disabled action whose destination remains a mockup placeholder. */
interface UnavailableActionProps extends PropsWithChildren {
    outlined?: boolean;
}

/** Presents a local link using the mockup's animated corner-frame treatment. */
export function LandingAction({ href, children }: LandingActionProps) {
    return (
        <Button asChild size="4" variant="solid" className={`${styles.corners} ${styles.portfolio}`}>
            <a href={href}>{children}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></a>
        </Button>
    );
}

/** Keeps unavailable destinations disabled instead of introducing fabricated external links. */
export function UnavailableAction({ outlined = false, children }: UnavailableActionProps) {
    const variant = outlined ? 'outline' : 'solid';
    const className = outlined ? styles.unavailable : `${styles.unavailable} ${styles.corners}`;

    return (
        <Button size="4" variant={variant} className={className} disabled>
            {children}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Button>
    );
}
