import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip, IconButton } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate, ArrowIcon } from '../study';

type PreviewProps = {
    treatment: 'top' | 'right';
};

/** Explores tooltip with two provisional visual treatments. */
function TooltipPreview({ treatment }: PreviewProps) {
    return (
        <Tooltip content="Continue to the next section" side={treatment}>
            <IconButton aria-label="Next section" variant="outline">
                <ArrowIcon />
            </IconButton>
        </Tooltip>
    );
}

/** Compares the two tooltip candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Above">
                <TooltipPreview treatment="top" />
            </Candidate>
            <Candidate title="To the right">
                <TooltipPreview treatment="right" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the tooltip study and its candidate controls. */
const meta = {
    title: 'Components/Overlays/Tooltip',
    component: TooltipPreview,
    args: { treatment: 'top' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['top', 'right'] },
    },
} satisfies Meta<typeof TooltipPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive tooltip specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TooltipPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side tooltip candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
