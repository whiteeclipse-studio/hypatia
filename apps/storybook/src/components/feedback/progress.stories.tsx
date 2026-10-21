import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'partial' | 'complete';
};

/** Explores progress with two provisional visual treatments. */
function ProgressPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-stack">
            <Text as="p">Catalogue review</Text>
            <Progress value={treatment === 'partial' ? 45 : 100} aria-label="Catalogue review" />
            <Text size="2">{treatment === 'partial' ? '45% complete' : 'Complete'}</Text>
        </div>
    );
}

/** Compares the two progress candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="In progress">
                <ProgressPreview treatment="partial" />
            </Candidate>
            <Candidate title="Complete">
                <ProgressPreview treatment="complete" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the progress study and its candidate controls. */
const meta = {
    title: 'Components/Feedback/Progress',
    component: ProgressPreview,
    args: { treatment: 'partial' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['partial', 'complete'] },
    },
} satisfies Meta<typeof ProgressPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive progress specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ProgressPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side progress candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
