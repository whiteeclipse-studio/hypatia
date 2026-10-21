import { Badge, Button, Code, Heading, Link, Text, useThemeContext } from '@whiteeclipse/core-ui';
import logoDark from '../landing/assets/white-eclipse-dark.png';
import logoLight from '../landing/assets/white-eclipse-light.png';
import '../woven-background.css';
import './documentation.css';

const sections = [
    { id: 'docs-overview', label: 'Overview' },
    { id: 'docs-structure', label: 'Documentation structure' },
    { id: 'docs-publication', label: 'Publication and access' },
];

/** Displays the supplied theme-aware brand beside a separate documentation identity. */
function DocumentationHeader() {
    const { appearance } = useThemeContext();
    const logo = appearance === 'dark' ? logoDark : logoLight;
    return (
        <header className="docs-header">
            <div className="docs-brand"><img src={logo} alt="" width="36" height="36" />
                <Text weight="medium" className="docs-wordmark">White Eclipse</Text><span aria-hidden="true">/</span><Text color="gray">Documentation</Text>
            </div>
            <Text size="1" color="gray">Engineering knowledge, in one place.</Text>
        </header>
    );
}

/** Uses native disclosure controls to retain the source directory hierarchy. */
function DocumentationNavigation() {
    return (
        <nav className="docs-sidebar" aria-label="Documentation tree">
            <Text as="p" className="docs-eyebrow">[ Project ]</Text>
            <label className="docs-project">Repository<select defaultValue="hypatia" aria-label="Repository">
                <option value="hypatia">Hypatia</option>
                <option disabled>Other repositories — not loaded</option>
            </select></label>
            <div className="docs-source"><span className="docs-source-dot" aria-hidden="true" />Public repository · main</div>
            <div className="docs-tree">
                <details open><summary>public</summary><Text as="p" size="2" color="gray">No sample pages</Text></details>
                <details open><summary>internal</summary>
                    <details><summary>rfcs</summary><span className="docs-tree-note">Not loaded in this sample</span></details>
                    <details><summary>designs</summary><span className="docs-tree-note">Not loaded in this sample</span></details>
                    <details><summary>reference</summary><span className="docs-tree-note">Not loaded in this sample</span></details>
                </details>
                <details open><summary>standards</summary>
                    <Link href="#docs-title" aria-current="page" className="docs-current">Documentation standards</Link>
                    <Link href="#docs-publication">Governance · excerpt</Link>
                    <details><summary>categories</summary><span className="docs-tree-note">Not loaded in this sample</span></details>
                    <details><summary>models</summary><span className="docs-tree-note">Not loaded in this sample</span></details>
                </details>
            </div>
            <div className="docs-sidebar-note"><Text as="p" size="1" color="gray">Source structure, shared interface.</Text>
                <Text as="p" size="1" color="gray">Internal describes a document’s audience, not its access permissions.</Text></div>
        </nav>
    );
}

/** Composes existing source excerpts into an illustrative reading page, not a Markdown renderer. */
function DocumentationArticle() {
    return (
        <article className="docs-article" aria-labelledby="docs-title">
            <nav aria-label="Breadcrumb" className="docs-breadcrumb"><Link href="#docs-title">Hypatia</Link><span>/</span><span>standards</span><span>/</span><span>README.md</span></nav>
            <div className="docs-article-meta"><Text className="docs-eyebrow">[ Standards / 01 ]</Text><Badge variant="outline" color="gray">Public access</Badge></div>
            <Heading as="h1" id="docs-title" className="docs-title">Documentation<br />standards.</Heading>
            <Text as="p" size="4" color="gray" className="docs-lead">A common structure for knowledge that stays useful as projects grow.</Text>
            <div className="docs-file-meta"><Code>docs/standards/README.md</Code><Text size="1" color="gray">English source · revision 1</Text></div>
            <section id="docs-overview"><Heading as="h2" size="5">Overview</Heading>
                <Text as="p">This document is the entrypoint to the documentation standards for projects built with the Hypatia model. It defines the shared documentation structure and directs authors to the standards and reusable models for each documentation category.</Text>
            </section>
            <section id="docs-structure"><Heading as="h2" size="5">Documentation structure</Heading>
                <Text as="p">The shared hierarchy separates public documentation from internal documentation, including optional project-maintained standards.</Text>
                <div className="docs-directory-table"><table><caption>Canonical source directories</caption><thead><tr><th scope="col">Directory</th><th scope="col">Contents</th></tr></thead>
                    <tbody><tr><th scope="row"><Code>docs/public/</Code></th><td>User guides and API documentation</td></tr>
                    <tr><th scope="row"><Code>docs/internal/</Code></th><td>Decisions, designs and technical references</td></tr>
                    <tr><th scope="row"><Code>docs/standards/</Code></th><td>Shared standards and reusable models</td></tr></tbody></table></div>
            </section>
            <section id="docs-publication"><Heading as="h2" size="5">Publication and access</Heading>
                <Text as="p">Documentation websites publish public documentation and its supporting assets. Internal documentation can also be published, subject to the source project’s access restrictions.</Text>
                <aside className="docs-callout"><Text as="p" weight="medium">Directory names do not grant or restrict access.</Text>
                    <Text as="p" size="2">This sample represents the public-repository pipeline proposed in RFC-0002. All documentation shown here is publicly accessible.</Text></aside>
            </section>
            <footer className="docs-article-footer"><Text size="1" color="gray">Copyright © 2026 White Eclipse · MIT License</Text><Link href="#docs-title" size="2">Back to top <span className="docs-up-chevron" aria-hidden="true" /></Link></footer>
        </article>
    );
}

/** Provides local section navigation without implying search or remote document loading. */
function DocumentationContents() {
    const links = sections.map(section => <Link key={section.id} href={`#${section.id}`}>{section.label}</Link>);
    return <nav className="docs-contents" aria-label="On this page"><Text as="p" className="docs-eyebrow">[ On this page ]</Text>{links}
        <div className="docs-contents-note"><Text as="p" size="1" color="gray">Hypatia</Text><Text as="p" size="1" color="gray">Documentation standard</Text></div>
    </nav>;
}

/** Demonstrates a responsive Core UI reading surface with only local interactions. */
export function DocumentationReference() {
    return (
        <div className="documentation-reference sample-woven-background">
            <a href="#docs-title" className="docs-skip">Skip to content</a>
            <DocumentationHeader />
            <div className="docs-mobile-nav"><details><summary>Browse documentation</summary><DocumentationNavigation /></details></div>
            <div className="docs-layout"><div className="docs-desktop-nav"><DocumentationNavigation /></div><main><DocumentationArticle /></main><DocumentationContents /></div>
            <div className="docs-prototype-note"><Text size="1" color="gray">Exploratory Core UI mockup · Selected excerpts and illustrative navigation</Text><Button size="1" variant="ghost" disabled>FR unavailable</Button></div>
        </div>
    );
}
