import type { Meta, StoryObj } from '@storybook/react-vite';

import { Inset, Card, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'top' | 'x';
};

/** Explores inset with two provisional visual treatments. */
function InsetPreview({ treatment }: PreviewProps) {
    return (
        <Card size="3">
            <Inset side={treatment} pb="current">
                <div className="study-panel">Edge-to-edge supporting content</div>
            </Inset>
            <Text as="p">Card content retains its own padding.</Text>
        </Card>
    );
}

/** Compares the two inset candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Top inset">
                <InsetPreview treatment="top" />
            </Candidate>
            <Candidate title="Horizontal inset">
                <InsetPreview treatment="x" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the inset study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Inset',
    component: InsetPreview,
    args: { treatment: 'top' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['top', 'x'] },
    },
} satisfies Meta<typeof InsetPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive inset specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <InsetPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side inset candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
