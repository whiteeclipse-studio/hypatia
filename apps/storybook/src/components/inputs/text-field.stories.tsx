import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { TextField, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'soft';
    disabled?: boolean;
};

/** Explores text field with two provisional visual treatments. */
function TextFieldPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <div className="study-stack">
            <label htmlFor={id}>Display name</label>
            <TextField.Root id={id} placeholder="Your display name" variant={treatment} disabled={disabled} />
            <Text as="p" size="2" color="gray">Shown in this preview only.</Text>
            <label htmlFor={`${id}-invalid`}>Project name</label>
            <TextField.Root
                id={`${id}-invalid`}
                defaultValue=""
                placeholder="Required"
                variant={treatment}
                aria-invalid="true"
                aria-describedby={`${id}-error`}
                disabled={disabled}
            />
            <Text as="p" id={`${id}-error`} size="2" color="red">Enter a project name.</Text>
            <TextField.Root aria-label="Read-only identifier" value="CORE-001" readOnly variant={treatment} />
        </div>
    );
}

/** Compares the two text field candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <TextFieldPreview treatment="surface" />
            </Candidate>
            <Candidate title="Soft">
                <TextFieldPreview treatment="soft" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the text field study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Text field',
    component: TextFieldPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'soft'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof TextFieldPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive text field specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TextFieldPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side text field candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
