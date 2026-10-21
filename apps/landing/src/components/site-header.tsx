import { Link } from '@whiteeclipse/core-ui';
import { Brand } from './brand';
import { LanguageOptions } from './language-options';
import styles from './chrome.module.css';

/** Connects the main navigation to the mockup's sections on this page. */
export function SiteHeader() {
    return (
        <header className={styles.header}>
            <Brand />
            <nav className={styles.navigation} aria-label="Main navigation">
                <Link href="#landing-portfolio">Portfolio</Link>
                <Link href="#landing-services">Services</Link>
                <Link href="#landing-blog">Blog</Link>
                <Link href="#landing-contact">Contact</Link>
            </nav>
            <LanguageOptions />
        </header>
    );
}
