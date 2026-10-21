import type { Meta, StoryObj } from '@storybook/react-vite';

import { Reset } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
};

/** Explores reset with two provisional visual treatments. */
function ResetPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-stack">
            <Reset>
                <button type="button" className="primitive-slotted" data-treatment={treatment}>Reset element styling</button>
            </Reset>
            <p>Reset supplies the base; the local candidate supplies appearance.</p>
        </div>
    );
}

/** Compares the two reset candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <ResetPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <ResetPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the reset study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Reset',
    component: ResetPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof ResetPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive reset specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ResetPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side reset candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
