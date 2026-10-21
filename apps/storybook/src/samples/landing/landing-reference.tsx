import type { PropsWithChildren } from 'react';
import { Box, Button, Heading, Link, Separator, Text, useThemeContext } from '@whiteeclipse/core-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowRight, faCode, faGears, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';
import { faClone } from '@fortawesome/free-regular-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import orbitalPlaceholder from './assets/orbital-placeholder.png';
import eclipsePlaceholder from './assets/eclipse-placeholder.png';
import logoDark from './assets/white-eclipse-dark.png';
import logoLight from './assets/white-eclipse-light.png';
import '../woven-background.css';
import './landing.css';

const services = [
    { title: 'Consulting', icon: faClone, description: 'Architecture, technical strategy and hands-on engineering support.' },
    { title: 'Modernisation', icon: faCode, description: 'More reliable systems. Better security and developer experience.' },
    { title: 'Automation & AI', icon: faGears, description: 'Workflow automation, AI-assisted tools and knowledge systems.' },
    { title: 'Selected development', icon: faTableCellsLarge, description: 'Our own tools, open-source projects and experiments.' },
];

/** Places temporary generated artwork without adding an interactive portfolio. */
function ArtworkPlaceholder({ source, className = '' }: { source: string; className?: string }) {
    return <img src={source} alt="" className={`landing-artwork ${className}`} />;
}

/** Pairs the wordmark with the supplied company logo for the active Core UI appearance. */
function Brand({ footer = false }: { footer?: boolean }) {
    const { appearance } = useThemeContext();
    const logo = appearance === 'dark' ? logoDark : logoLight;

    return (
        <div className="landing-brand">
            <img src={logo} alt="" className="landing-logo" width="64" height="64" />
            <div>
                <Text as="p" className="landing-wordmark">White Eclipse</Text>
                {footer && <Text as="p" size="1" color="gray">Software engineering & consulting</Text>}
            </div>
        </div>
    );
}

/** Identifies the displayed language while keeping translation explicitly unavailable. */
function LanguageOptions() {
    return (
        <div className="landing-language" aria-label="Language">
            <Button size="1" variant="ghost" disabled aria-label="French translation unavailable">FR</Button>
            <Separator orientation="vertical" size="1" />
            <Text size="1" weight="bold" lang="en" aria-label="Current language: English">EN</Text>
        </div>
    );
}

/** Connects the header navigation to sections in this sample. */
function LandingHeader() {
    return (
        <header className="landing-header">
            <Brand />
            <nav className="landing-navigation" aria-label="Main navigation">
                <Link href="#landing-portfolio">Portfolio</Link>
                <Link href="#landing-services">Services</Link>
                <Link href="#landing-blog">Blog</Link>
                <Link href="#landing-contact">Contact</Link>
            </nav>
            <LanguageOptions />
        </header>
    );
}

/** Uses the existing corner-outline primary treatment for local page navigation. */
function LandingAction({ href, children }: PropsWithChildren<{ href: string }>) {
    return (
        <Button asChild size="4" variant="solid" className="primary-button landing-action" data-treatment="plain">
            <a href={href}>{children}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></a>
        </Button>
    );
}

/** Supplies the mockup's editorial hierarchy beside a reserved portfolio illustration. */
function LandingHero() {
    return (
        <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-hero-copy">
                <Text as="p" className="landing-eyebrow">[ Explore our work ]</Text>
                <Heading as="h1" id="landing-title" className="landing-title">Same curiosity.<br />Different orbits.</Heading>
                <Text as="p" size="5" color="gray" className="landing-description">
                    Explore Cydonia, our portfolio of projects, experiments and open-source work.
                </Text>
                <LandingAction href="#landing-portfolio">Explore the portfolio</LandingAction>
                <Link href="#landing-studio" size="2" underline="always" className="landing-studio-link">
                    Meet the studio<FontAwesomeIcon icon={faArrowDown} aria-hidden="true" />
                </Link>
            </div>
            <div id="landing-portfolio" className="landing-portfolio" tabIndex={-1}>
                <Text as="p" className="landing-eyebrow">Cydonia / Portfolio</Text>
                <ArtworkPlaceholder source={orbitalPlaceholder} className="landing-orbits" />
            </div>
        </section>
    );
}

/** Gives each major section the reference layout's numbered annotation. */
function SectionLabel({ children }: PropsWithChildren) {
    return <Text as="p" className="landing-eyebrow">{children}</Text>;
}

/** Presents one service with a decorative Font Awesome icon and visible label. */
function ServiceCard({ title, description, icon }: typeof services[number]) {
    return (
        <article className="landing-service">
            <FontAwesomeIcon icon={icon} className="landing-service-icon" aria-hidden="true" />
            <Heading as="h3" size="4" weight="medium">{title}</Heading>
            <Text as="p" size="3" color="gray">{description}</Text>
        </article>
    );
}

/** Composes the four service summaries without embedding iteration in the page markup. */
function LandingServices() {
    const cards = services.map(service => <ServiceCard key={service.title} {...service} />);
    return <div id="landing-services" className="landing-services">{cards}</div>;
}

/** Sets the studio statement and services in the mockup's second horizontal band. */
function LandingStudio() {
    return (
        <section id="landing-studio" className="landing-studio" aria-labelledby="landing-studio-title">
            <SectionLabel>01 [ The studio ]</SectionLabel>
            <div className="landing-studio-intro">
                <div className="landing-studio-statement">
                    <Heading as="h2" id="landing-studio-title" className="landing-section-title">
                        Pragmatic engineering for real-world impact.
                    </Heading>
                    <ArtworkPlaceholder source={eclipsePlaceholder} className="landing-eclipse" />
                </div>
                <div className="landing-studio-copy">
                    <Text as="p" size="5" color="gray">
                        We help organisations design, build and operate reliable software, with a focus on maintainability, automation and long-term value.
                    </Text>
                    <Separator size="4" />
                    <Text as="p" className="landing-eyebrow">[ What we do ]</Text>
                </div>
            </div>
            <LandingServices />
        </section>
    );
}

/** Keeps unimplemented blog and contact destinations visible as disabled actions. */
function LandingNextSteps() {
    return (
        <div className="landing-next-steps">
            <section id="landing-blog" aria-labelledby="landing-blog-title">
                <SectionLabel>02 [ The blog ]</SectionLabel>
                <Heading as="h2" id="landing-blog-title" className="landing-section-title">From the blog.</Heading>
                <Text as="p" size="4" color="gray">Notes on software, systems and the things we learn along the way.</Text>
                <Button size="4" variant="outline" disabled>Read the blog<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></Button>
                <Text as="p" size="1" color="gray">Blog destination placeholder</Text>
            </section>
            <section id="landing-contact" aria-labelledby="landing-contact-title">
                <SectionLabel>03 [ Start a conversation ]</SectionLabel>
                <Heading as="h2" id="landing-contact-title" className="landing-section-title">Let’s build<br />what’s next.</Heading>
                <Text as="p" size="4" color="gray">Have a project in mind? Tell us what you’re working on.</Text>
                <Button size="4" variant="solid" className="primary-button" disabled>Get in touch<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></Button>
                <Text as="p" size="1" color="gray">Contact destination placeholder</Text>
                <ArtworkPlaceholder source={orbitalPlaceholder} className="landing-footer-art" />
            </section>
        </div>
    );
}

/** Closes the sample with the repeated brand and reserved external destinations. */
function LandingFooter() {
    return (
        <footer className="landing-footer">
            <Brand footer />
            <div className="landing-footer-links" aria-label="Social destination placeholders">
                <Button size="1" variant="ghost" disabled><FontAwesomeIcon icon={faGithub} aria-hidden="true" />GitHub</Button>
                <Button size="1" variant="ghost" disabled><FontAwesomeIcon icon={faLinkedin} aria-hidden="true" />LinkedIn</Button>
                <Link href="#landing-contact" size="2">Contact</Link>
            </div>
            <LanguageOptions />
        </footer>
    );
}

/** Exploratory Core UI composition with generated placeholder art and Font Awesome icons. */
export function LandingReference() {
    return (
        <Box className="landing-surface sample-woven-background">
            <Box className="landing-reference">
                <LandingHeader />
                <Separator size="4" />
                <main>
                    <LandingHero />
                    <Separator size="4" />
                    <LandingStudio />
                    <Separator size="4" />
                    <LandingNextSteps />
                </main>
                <Separator size="4" />
                <LandingFooter />
            </Box>
        </Box>
    );
}
