import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'spacious' | 'compact';
};

/** Explores box with two provisional visual treatments. */
function BoxPreview({ treatment }: PreviewProps) {
    return (
        <Box p={treatment === 'spacious' ? '6' : '3'} className="study-panel">A bounded area of content.</Box>
    );
}

/** Compares the two box candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Spacious">
                <BoxPreview treatment="spacious" />
            </Candidate>
            <Candidate title="Compact">
                <BoxPreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the box study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Box',
    component: BoxPreview,
    args: { treatment: 'spacious' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['spacious', 'compact'] },
    },
} satisfies Meta<typeof BoxPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive box specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <BoxPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side box candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
