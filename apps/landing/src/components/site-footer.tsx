import { Button, Link } from '@whiteeclipse/core-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Brand } from './brand';
import { LanguageOptions } from './language-options';
import styles from './chrome.module.css';

/** Repeats the brand and preserves the mockup's unavailable social destinations. */
export function SiteFooter() {
    return (
        <footer className={styles.footer}>
            <Brand footer />
            <div className={styles.footerLinks} role="group" aria-label="Social destination placeholders">
                <Button size="1" variant="ghost" disabled><FontAwesomeIcon icon={faGithub} aria-hidden="true" />GitHub</Button>
                <Button size="1" variant="ghost" disabled><FontAwesomeIcon icon={faLinkedin} aria-hidden="true" />LinkedIn</Button>
                <Link href="#landing-contact" size="2">Contact</Link>
            </div>
            <LanguageOptions />
        </footer>
    );
}
