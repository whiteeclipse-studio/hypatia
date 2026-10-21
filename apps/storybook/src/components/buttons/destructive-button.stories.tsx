import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
    disabled?: boolean;
};

/** Explores destructive-action styling without executing any destructive operation. */
function DestructiveButtonPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <div className="study-row">
            <Button variant={treatment} color="red" disabled={disabled}>Remove preview</Button>
            <Button variant={treatment} color="red" disabled>Unavailable</Button>
        </div>
    );
}

/** Compares the two destructive action candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid">
                <DestructiveButtonPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline">
                <DestructiveButtonPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the destructive action study and its candidate controls. */
const meta = {
    title: 'Components/Buttons/Destructive action',
    component: DestructiveButtonPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof DestructiveButtonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive destructive action specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <DestructiveButtonPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side destructive action candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
