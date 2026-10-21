import type { Meta, StoryObj } from '@storybook/react-vite';
import { LandingReference } from './landing-reference';

/** Registers composed page references separately from individual component studies. */
const meta = {
    title: 'Samples/Landing',
    component: LandingReference,
    parameters: { controls: { disable: true } },
} satisfies Meta<typeof LandingReference>;
export default meta;

/** Landing layout with generated temporary artwork and Font Awesome icon candidates. */
export const Default: StoryObj<typeof meta> = {};
