import { Heading, Text } from '@whiteeclipse/core-ui';
import orbitalArtwork from '../assets/orbital-placeholder.png';
import { Artwork } from './artwork';
import { UnavailableAction } from './action';
import { SectionLabel } from './section-label';
import typography from './typography.module.css';
import styles from './next-steps.module.css';

/** Displays the illustrative blog introduction with an unavailable destination. */
function BlogSection() {
    return (
        <section id="landing-blog" className={styles.section} aria-labelledby="landing-blog-title">
            <SectionLabel>02 [ The blog ]</SectionLabel>
            <Heading as="h2" id="landing-blog-title" className={typography.sectionTitle}>From the blog.</Heading>
            <Text as="p" size="4" color="gray">Notes on software, systems and the things we learn along the way.</Text>
            <UnavailableAction outlined>Read the blog</UnavailableAction>
            <Text as="p" size="1" color="gray">Blog destination placeholder</Text>
        </section>
    );
}

/** Preserves the mockup's contact invitation and decorative cropped portfolio artwork. */
function ContactSection() {
    return (
        <section id="landing-contact" className={styles.section} aria-labelledby="landing-contact-title">
            <SectionLabel>03 [ Start a conversation ]</SectionLabel>
            <Heading as="h2" id="landing-contact-title" className={typography.sectionTitle}>Let’s build<br />what’s next.</Heading>
            <Text as="p" size="4" color="gray">Have a project in mind? Tell us what you’re working on.</Text>
            <UnavailableAction>Get in touch</UnavailableAction>
            <Text as="p" size="1" color="gray">Contact destination placeholder</Text>
            <Artwork source={orbitalArtwork} className={styles.footerArt} />
        </section>
    );
}

/** Composes the lower-page destinations while retaining their explicit placeholder state. */
export function NextSteps() {
    return <div className={styles.nextSteps}><BlogSection /><ContactSection /></div>;
}
