import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card, Heading, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'classic';
};

/** Explores card with two provisional visual treatments. */
function CardPreview({ treatment }: PreviewProps) {
    return (
        <Card variant={treatment} size="3">
            <Heading as="h3" size="4" mb="2">Core UI</Heading>
            <Text as="p" size="2" color="gray">A shared foundation for thoughtful interfaces.</Text>
        </Card>
    );
}

/** Compares the two card candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <CardPreview treatment="surface" />
            </Candidate>
            <Candidate title="Classic">
                <CardPreview treatment="classic" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the card study and its candidate controls. */
const meta = {
    title: 'Components/Content/Card',
    component: CardPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'classic'] },
    },
} satisfies Meta<typeof CardPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive card specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <CardPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side card candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
