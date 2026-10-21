import { Heading, Link, Text } from '@whiteeclipse/core-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import orbitalArtwork from '../assets/orbital-placeholder.png';
import { Artwork } from './artwork';
import { LandingAction } from './action';
import { SectionLabel } from './section-label';
import styles from './hero.module.css';

/** Introduces the studio's work beside the mockup's reserved orbital portfolio artwork. */
export function Hero() {
    return (
        <section className={styles.hero} aria-labelledby="landing-title">
            <div className={styles.copy}>
                <SectionLabel>[ Explore our work ]</SectionLabel>
                <Heading as="h1" id="landing-title" className={styles.title}>Same curiosity.<br />Different orbits.</Heading>
                <Text as="p" size="5" color="gray" className={styles.description}>
                    Explore Cydonia, our portfolio of projects, experiments and open-source work.
                </Text>
                <LandingAction href="#landing-portfolio">Explore the portfolio</LandingAction>
                <Link href="#landing-studio" size="2" underline="always" className={styles.studioLink}>
                    Meet the studio<FontAwesomeIcon icon={faArrowDown} aria-hidden="true" />
                </Link>
            </div>
            <div id="landing-portfolio" className={styles.portfolio} tabIndex={-1}>
                <SectionLabel>Cydonia / Portfolio</SectionLabel>
                <Artwork source={orbitalArtwork} className={styles.orbits} />
            </div>
        </section>
    );
}
