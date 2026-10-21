import type { Meta, StoryObj } from '@storybook/react-vite';

import { Section, Heading, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'compact' | 'spacious';
};

/** Explores section with two provisional visual treatments. */
function SectionPreview({ treatment }: PreviewProps) {
    return (
        <Section size={treatment === 'compact' ? '1' : '2'} className="study-panel">
            <Heading as="h3" size="4">A content section</Heading>
            <Text as="p" mt="2">Consistent vertical rhythm groups related information.</Text>
        </Section>
    );
}

/** Compares the two section candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Compact section">
                <SectionPreview treatment="compact" />
            </Candidate>
            <Candidate title="Spacious section">
                <SectionPreview treatment="spacious" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the section study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Section',
    component: SectionPreview,
    args: { treatment: 'compact' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['compact', 'spacious'] },
    },
} satisfies Meta<typeof SectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive section specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SectionPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side section candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
