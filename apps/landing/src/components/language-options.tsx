import { Button, Separator, Text } from '@whiteeclipse/core-ui';
import styles from './chrome.module.css';

/** Identifies English as current and keeps the mockup's French option unavailable. */
export function LanguageOptions() {
    return (
        <div className={styles.language} role="group" aria-label="Language">
            <Button size="1" variant="ghost" disabled aria-label="French translation unavailable">FR</Button>
            <Separator orientation="vertical" size="1" />
            <Text size="1" weight="bold" lang="en" aria-label="Current language: English">EN</Text>
        </div>
    );
}
