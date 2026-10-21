import { Text, useThemeContext } from '@whiteeclipse/core-ui';
import logoDark from '../assets/white-eclipse-dark.png';
import logoLight from '../assets/white-eclipse-light.png';
import styles from './chrome.module.css';

/** Options for the repeated wordmark and optional footer description. */
interface BrandProps {
    footer?: boolean;
}

/** Chooses the supplied logo for the active theme and pairs it with the brand name. */
export function Brand({ footer = false }: BrandProps) {
    const { appearance } = useThemeContext();
    const logo = appearance === 'dark' ? logoDark : logoLight;

    return (
        <div className={styles.brand}>
            <img src={logo} alt="" className={styles.logo} width="64" height="64" />
            <div>
                <Text as="p" className={styles.wordmark}>White Eclipse</Text>
                {footer && <Text as="p" size="1" color="gray">Software engineering &amp; consulting</Text>}
            </div>
        </div>
    );
}
