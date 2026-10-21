import type { Meta, StoryObj } from '@storybook/react-vite';

import { Callout } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate, ArrowIcon } from '../study';

type PreviewProps = {
    treatment: 'soft' | 'outline';
};

/** Explores callout with two provisional visual treatments. */
function CalloutPreview({ treatment }: PreviewProps) {
    return (
        <Callout.Root variant={treatment}>
            <Callout.Icon>
                <ArrowIcon />
            </Callout.Icon>
            <Callout.Text>This component is an exploratory design candidate.</Callout.Text>
        </Callout.Root>
    );
}

/** Compares the two callout candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Soft">
                <CalloutPreview treatment="soft" />
            </Candidate>
            <Candidate title="Outline">
                <CalloutPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the callout study and its candidate controls. */
const meta = {
    title: 'Components/Feedback/Callout',
    component: CalloutPreview,
    args: { treatment: 'soft' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['soft', 'outline'] },
    },
} satisfies Meta<typeof CalloutPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive callout specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <CalloutPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side callout candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
