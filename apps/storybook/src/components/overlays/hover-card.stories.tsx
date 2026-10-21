import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEvent } from 'react';

import { HoverCard, Link, Text, Heading } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'bottom' | 'right';
};

/** Explores supplementary author details; essential information stays in the visible link. */
function HoverCardPreview({ treatment }: PreviewProps) {
    function preventNavigation(event: MouseEvent) {
        event.preventDefault();
    }

    return (
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Link href="#profile" onClick={preventNavigation}>Example author</Link>
            </HoverCard.Trigger>
            <HoverCard.Content side={treatment} width="280px">
                <Heading as="h3" size="4">Example author</Heading>
                <Text as="p" size="2">Writes about clear interfaces and shared knowledge.</Text>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}

/** Compares the two hover card candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Below">
                <HoverCardPreview treatment="bottom" />
            </Candidate>
            <Candidate title="To the right">
                <HoverCardPreview treatment="right" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the hover card study and its candidate controls. */
const meta = {
    title: 'Components/Overlays/Hover card',
    component: HoverCardPreview,
    args: { treatment: 'bottom' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['bottom', 'right'] },
    },
} satisfies Meta<typeof HoverCardPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive hover card specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <HoverCardPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side hover card candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
