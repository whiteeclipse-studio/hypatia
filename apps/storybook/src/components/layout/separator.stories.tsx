import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'horizontal' | 'vertical';
};

/** Explores separator with two provisional visual treatments. */
function SeparatorPreview({ treatment }: PreviewProps) {
    return (
        <div className={treatment === 'horizontal' ? 'study-stack' : 'study-row'}>
            <Text>Overview</Text>
            <Separator orientation={treatment} size="4" />
            <Text>Details</Text>
        </div>
    );
}

/** Compares the two separator candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Horizontal">
                <SeparatorPreview treatment="horizontal" />
            </Candidate>
            <Candidate title="Vertical">
                <SeparatorPreview treatment="vertical" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the separator study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Separator',
    component: SeparatorPreview,
    args: { treatment: 'horizontal' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    },
} satisfies Meta<typeof SeparatorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive separator specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SeparatorPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side separator candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
