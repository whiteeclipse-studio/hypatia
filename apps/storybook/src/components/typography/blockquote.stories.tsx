import type { Meta, StoryObj } from '@storybook/react-vite';

import { Blockquote } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'reading' | 'compact';
};

/** Explores blockquote with two provisional visual treatments. */
function BlockquotePreview({ treatment }: PreviewProps) {
    return (
        <Blockquote size={treatment === 'reading' ? '4' : '2'}>Clarity comes from deliberate choices and room to read.</Blockquote>
    );
}

/** Compares the two blockquote candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Reading">
                <BlockquotePreview treatment="reading" />
            </Candidate>
            <Candidate title="Compact">
                <BlockquotePreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the blockquote study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Blockquote',
    component: BlockquotePreview,
    args: { treatment: 'reading' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['reading', 'compact'] },
    },
} satisfies Meta<typeof BlockquotePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive blockquote specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <BlockquotePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side blockquote candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
