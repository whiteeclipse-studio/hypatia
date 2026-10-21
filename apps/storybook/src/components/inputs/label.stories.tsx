import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Primitives, TextField } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'plain' | 'emphasized';
    disabled?: boolean;
};

/** Explores label with two provisional visual treatments. */
function LabelPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <div className="study-stack">
            <Primitives.Label.Root htmlFor={id} className={treatment === 'emphasized' ? 'study-label-strong' : undefined}>Display name</Primitives.Label.Root>
            <TextField.Root id={id} placeholder="Example reader" disabled={disabled} />
        </div>
    );
}

/** Compares the two label candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Plain label">
                <LabelPreview treatment="plain" />
            </Candidate>
            <Candidate title="Emphasized label">
                <LabelPreview treatment="emphasized" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the label study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Label',
    component: LabelPreview,
    args: { treatment: 'plain' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['plain', 'emphasized'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof LabelPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive label specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <LabelPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side label candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
