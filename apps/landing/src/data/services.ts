import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCode, faGears, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';
import { faClone } from '@fortawesome/free-regular-svg-icons';

/** One illustrative service summary from the existing landing mockup. */
export interface Service {
    title: string;
    icon: IconDefinition;
    description: string;
}

/** Mockup copy and decorative icons; these do not establish a final service offering. */
export const services: readonly Service[] = [
    { title: 'Consulting', icon: faClone, description: 'Architecture, technical strategy and hands-on engineering support.' },
    { title: 'Modernisation', icon: faCode, description: 'More reliable systems. Better security and developer experience.' },
    { title: 'Automation & AI', icon: faGears, description: 'Workflow automation, AI-assisted tools and knowledge systems.' },
    { title: 'Selected development', icon: faTableCellsLarge, description: 'Our own tools, open-source projects and experiments.' },
];
