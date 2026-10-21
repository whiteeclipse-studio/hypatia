import type { Meta, StoryObj } from '@storybook/react-vite';

import { Em, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'reading' | 'compact';
};

/** Explores em with two provisional visual treatments. */
function EmPreview({ treatment }: PreviewProps) {
    return (
        <Text as="p" size={treatment === 'reading' ? '4' : '2'}>A design can be <Em>quiet and expressive</Em>.</Text>
    );
}

/** Compares the two em candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Reading">
                <EmPreview treatment="reading" />
            </Candidate>
            <Candidate title="Compact">
                <EmPreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the em study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Em',
    component: EmPreview,
    args: { treatment: 'reading' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['reading', 'compact'] },
    },
} satisfies Meta<typeof EmPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive em specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <EmPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side em candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
