import { Heading, Separator, Text } from '@whiteeclipse/core-ui';
import eclipseArtwork from '../assets/eclipse-placeholder.png';
import { Artwork } from './artwork';
import { SectionLabel } from './section-label';
import { Services } from './services';
import typography from './typography.module.css';
import styles from './studio.module.css';

/** Pairs the mockup's studio statement and eclipse illustration with its service summaries. */
export function Studio() {
    return (
        <section id="landing-studio" className={styles.studio} aria-labelledby="landing-studio-title">
            <SectionLabel>01 [ The studio ]</SectionLabel>
            <div className={styles.intro}>
                <div className={styles.statement}>
                    <Heading as="h2" id="landing-studio-title" className={typography.sectionTitle}>
                        Pragmatic engineering for real-world impact.
                    </Heading>
                    <Artwork source={eclipseArtwork} className={styles.eclipse} />
                </div>
                <div className={styles.copy}>
                    <Text as="p" size="5" color="gray">
                        We help organisations design, build and operate reliable software, with a focus on maintainability, automation and long-term value.
                    </Text>
                    <Separator size="4" />
                    <SectionLabel>[ What we do ]</SectionLabel>
                </div>
            </div>
            <Services />
        </section>
    );
}
