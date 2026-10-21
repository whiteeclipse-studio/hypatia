import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccessibleIcon } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate, ArrowIcon } from '../study';

type PreviewProps = {
    treatment: 'next' | 'details';
};

/** Explores accessible icon with two provisional visual treatments. */
function AccessibleIconPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-row">
            <AccessibleIcon label={treatment === 'next' ? 'Continue' : 'Open details'}>
                <ArrowIcon />
            </AccessibleIcon>
            <span>Inspect the named icon with assistive technology.</span>
        </div>
    );
}

/** Compares the two accessible icon candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Continue label">
                <AccessibleIconPreview treatment="next" />
            </Candidate>
            <Candidate title="Details label">
                <AccessibleIconPreview treatment="details" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the accessible icon study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Accessible icon',
    component: AccessibleIconPreview,
    args: { treatment: 'next' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['next', 'details'] },
    },
} satisfies Meta<typeof AccessibleIconPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive accessible icon specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <AccessibleIconPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side accessible icon candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
