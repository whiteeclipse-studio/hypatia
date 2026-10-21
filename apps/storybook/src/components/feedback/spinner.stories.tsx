import type { Meta, StoryObj } from '@storybook/react-vite';

import { Spinner, Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'large' | 'compact';
    disabled?: boolean;
};

/** Explores spinner with two provisional visual treatments. */
function SpinnerPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <div className="study-row" role="status">
            <Spinner size={treatment === 'large' ? '3' : '1'} />
            <span>Loading preview</span>
            <Button disabled>Continue</Button>
        </div>
    );
}

/** Compares the two spinner candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Large">
                <SpinnerPreview treatment="large" />
            </Candidate>
            <Candidate title="Compact">
                <SpinnerPreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the spinner study and its candidate controls. */
const meta = {
    title: 'Components/Feedback/Spinner',
    component: SpinnerPreview,
    args: { treatment: 'large' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['large', 'compact'] },
    },
} satisfies Meta<typeof SpinnerPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive spinner specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SpinnerPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side spinner candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
