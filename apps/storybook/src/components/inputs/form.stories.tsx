import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Primitives, Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores the preview-status Radix Form primitive with local validation and no network submission. */
function FormPreview({ treatment, disabled = false }: PreviewProps) {
    const [status, setStatus] = useState('No form submitted.');
    function submit(event: FormEvent) {
        event.preventDefault();
        setStatus('Valid preview. No information was sent.');
    }

    return (
        <Primitives.Form.Root className="study-stack" data-treatment={treatment} onSubmit={submit}>
            <Primitives.Form.Field name="email" className="study-stack">
                <Primitives.Form.Label>Preview email</Primitives.Form.Label>
                <Primitives.Form.Control asChild>
                    <input
                        className="primitive-input"
                        type="email"
                        placeholder="reader@example.test"
                        required
                        disabled={disabled}
                    />
                </Primitives.Form.Control>
                <Primitives.Form.Message match="valueMissing" className="study-error">Enter an email address.</Primitives.Form.Message>
                <Primitives.Form.Message match="typeMismatch" className="study-error">Use an email address format.</Primitives.Form.Message>
            </Primitives.Form.Field>
            <Primitives.Form.Submit asChild>
                <Button disabled={disabled}>Validate preview</Button>
            </Primitives.Form.Submit>
            <p role="status">{status}</p>
        </Primitives.Form.Root>
    );
}

/** Compares the two form preview candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <FormPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <FormPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the form preview study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Form preview',
    component: FormPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof FormPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive form preview specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <FormPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side form preview candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
