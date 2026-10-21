import type { Meta, StoryObj } from '@storybook/react-vite';

import { Grid, Box } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'two' | 'one';
};

/** Explores grid with two provisional visual treatments. */
function GridPreview({ treatment }: PreviewProps) {
    return (
        <Grid columns={treatment === 'two' ? '2' : '1'} gap="3">
            <Box className="study-panel">First</Box>
            <Box className="study-panel">Second</Box>
            <Box className="study-panel">Third</Box>
        </Grid>
    );
}

/** Compares the two grid candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Two columns">
                <GridPreview treatment="two" />
            </Candidate>
            <Candidate title="Single column">
                <GridPreview treatment="one" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the grid study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Grid',
    component: GridPreview,
    args: { treatment: 'two' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['two', 'one'] },
    },
} satisfies Meta<typeof GridPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive grid specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <GridPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side grid candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
