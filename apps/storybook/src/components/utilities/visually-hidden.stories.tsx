import type { Meta, StoryObj } from '@storybook/react-vite';

import { VisuallyHidden, IconButton } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate, ArrowIcon } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
};

/** Explores visually hidden with two provisional visual treatments. */
function VisuallyHiddenPreview({ treatment }: PreviewProps) {
    return (
        <IconButton variant={treatment}>
            <ArrowIcon />
            <VisuallyHidden>Next section</VisuallyHidden>
        </IconButton>
    );
}

/** Compares the two visually hidden candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid action">
                <VisuallyHiddenPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline action">
                <VisuallyHiddenPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the visually hidden study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Visually hidden',
    component: VisuallyHiddenPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
    },
} satisfies Meta<typeof VisuallyHiddenPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive visually hidden specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <VisuallyHiddenPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side visually hidden candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
