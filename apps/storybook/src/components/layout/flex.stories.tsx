import type { Meta, StoryObj } from '@storybook/react-vite';

import { Flex, Badge } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'row' | 'column';
};

/** Explores flex with two provisional visual treatments. */
function FlexPreview({ treatment }: PreviewProps) {
    return (
        <Flex direction={treatment} gap="3" wrap="wrap">
            <Badge>First</Badge>
            <Badge>Second</Badge>
            <Badge>Third</Badge>
        </Flex>
    );
}

/** Compares the two flex candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Row">
                <FlexPreview treatment="row" />
            </Candidate>
            <Candidate title="Column">
                <FlexPreview treatment="column" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the flex study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Flex',
    component: FlexPreview,
    args: { treatment: 'row' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['row', 'column'] },
    },
} satisfies Meta<typeof FlexPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive flex specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <FlexPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side flex candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
