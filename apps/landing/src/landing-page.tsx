import { Separator } from '@whiteeclipse/core-ui';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';
import { Hero } from './components/hero';
import { Studio } from './components/studio';
import { NextSteps } from './components/next-steps';
import styles from './landing-page.module.css';

/** Composes the existing landing mockup with local section navigation and placeholder actions. */
export function LandingPage() {
    return (
        <div className={styles.surface}>
            <a className={styles.skipLink} href="#landing-main">Skip to content</a>
            <div className={styles.page}>
                <SiteHeader />
                <Separator size="4" />
                <main id="landing-main" tabIndex={-1}>
                    <Hero />
                    <Separator size="4" />
                    <Studio />
                    <Separator size="4" />
                    <NextSteps />
                </main>
                <Separator size="4" />
                <SiteFooter />
            </div>
        </div>
    );
}
