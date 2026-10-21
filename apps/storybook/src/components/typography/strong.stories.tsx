import type { Meta, StoryObj } from '@storybook/react-vite';

import { Strong, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'reading' | 'compact';
};

/** Explores strong with two provisional visual treatments. */
function StrongPreview({ treatment }: PreviewProps) {
    return (
        <Text as="p" size={treatment === 'reading' ? '4' : '2'}>Review the <Strong>selected revision</Strong> before acceptance.</Text>
    );
}

/** Compares the two strong candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Reading">
                <StrongPreview treatment="reading" />
            </Candidate>
            <Candidate title="Compact">
                <StrongPreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the strong study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Strong',
    component: StrongPreview,
    args: { treatment: 'reading' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['reading', 'compact'] },
    },
} satisfies Meta<typeof StrongPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive strong specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <StrongPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side strong candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
