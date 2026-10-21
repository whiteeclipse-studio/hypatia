import type { Meta, StoryObj } from '@storybook/react-vite';

import { Kbd } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'large' | 'compact';
};

/** Explores kbd with two provisional visual treatments. */
function KbdPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-row">
            <span>Open search</span>
            <Kbd size={treatment === 'large' ? '3' : '1'}>⌘ K</Kbd>
        </div>
    );
}

/** Compares the two kbd candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Large keys">
                <KbdPreview treatment="large" />
            </Candidate>
            <Candidate title="Compact keys">
                <KbdPreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the kbd study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Kbd',
    component: KbdPreview,
    args: { treatment: 'large' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['large', 'compact'] },
    },
} satisfies Meta<typeof KbdPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive kbd specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <KbdPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side kbd candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
