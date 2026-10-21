import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentationReference } from './documentation-reference';

/** Registers the exploratory documentation reading shell. */
const meta = {
    title: 'Samples/Documentation',
    component: DocumentationReference,
    parameters: { controls: { disable: true } },
} satisfies Meta<typeof DocumentationReference>;
export default meta;

/** Public documentation with directory navigation and local reading anchors. */
export const Default: StoryObj<typeof meta> = {};
