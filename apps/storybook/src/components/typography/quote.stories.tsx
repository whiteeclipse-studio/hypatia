import type { Meta, StoryObj } from '@storybook/react-vite';

import { Quote, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'reading' | 'compact';
};

/** Explores quote with two provisional visual treatments. */
function QuotePreview({ treatment }: PreviewProps) {
    return (
        <Text as="p" size={treatment === 'reading' ? '4' : '2'}>Our guiding principle is <Quote>clarity through consistency</Quote>.</Text>
    );
}

/** Compares the two quote candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Reading">
                <QuotePreview treatment="reading" />
            </Candidate>
            <Candidate title="Compact">
                <QuotePreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the quote study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Quote',
    component: QuotePreview,
    args: { treatment: 'reading' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['reading', 'compact'] },
    },
} satisfies Meta<typeof QuotePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive quote specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <QuotePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side quote candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
