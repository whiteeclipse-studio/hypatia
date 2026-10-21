import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Radio } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'soft';
    disabled?: boolean;
};

/** Explores radio with two provisional visual treatments. */
function RadioPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <fieldset className="study-fieldset study-stack">
            <legend>Reading preference</legend>
            <label className="study-row">
                <Radio name={id} value="light" defaultChecked variant={treatment} disabled={disabled} /> Light</label>
            <label className="study-row">
                <Radio name={id} value="dark" variant={treatment} disabled={disabled} /> Dark</label>
            <label className="study-row">
                <Radio name={id} value="auto" variant={treatment} disabled /> Automatic (unavailable)</label>
        </fieldset>
    );
}

/** Compares the two radio candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <RadioPreview treatment="surface" />
            </Candidate>
            <Candidate title="Soft">
                <RadioPreview treatment="soft" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the radio study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Radio',
    component: RadioPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'soft'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof RadioPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive radio specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <RadioPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side radio candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
