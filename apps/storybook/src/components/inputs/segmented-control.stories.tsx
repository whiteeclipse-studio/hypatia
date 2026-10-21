import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedControl } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'classic';
};

/** Explores segmented control with two provisional visual treatments. */
function SegmentedControlPreview({ treatment }: PreviewProps) {
    return (
        <SegmentedControl.Root defaultValue="day" variant={treatment} aria-label="Period">
            <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
            <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
            <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
        </SegmentedControl.Root>
    );
}

/** Compares the two segmented control candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <SegmentedControlPreview treatment="surface" />
            </Candidate>
            <Candidate title="Classic">
                <SegmentedControlPreview treatment="classic" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the segmented control study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Segmented control',
    component: SegmentedControlPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'classic'] },
    },
} satisfies Meta<typeof SegmentedControlPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive segmented control specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SegmentedControlPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side segmented control candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
