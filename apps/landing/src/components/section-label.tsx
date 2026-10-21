import type { PropsWithChildren } from 'react';
import { Text } from '@whiteeclipse/core-ui';
import styles from './typography.module.css';

/** Displays the mockup's monospace section annotations without adding a heading level. */
export function SectionLabel({ children }: PropsWithChildren) {
    return <Text as="p" className={styles.eyebrow}>{children}</Text>;
}
