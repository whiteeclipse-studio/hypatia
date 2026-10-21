import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'soft' | 'outline';
    disabled?: boolean;
};

/** Explores secondary action with two provisional visual treatments. */
function SecondaryButtonPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <div className="study-row">
            <Button variant={treatment} disabled={disabled}>View details</Button>
            <Button variant={treatment} disabled>Unavailable</Button>
        </div>
    );
}

/** Compares the two secondary action candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Soft">
                <SecondaryButtonPreview treatment="soft" />
            </Candidate>
            <Candidate title="Outline">
                <SecondaryButtonPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the secondary action study and its candidate controls. */
const meta = {
    title: 'Components/Buttons/Secondary action',
    component: SecondaryButtonPreview,
    args: { treatment: 'soft' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['soft', 'outline'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof SecondaryButtonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive secondary action specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SecondaryButtonPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side secondary action candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
