import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Primitives } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores the unstable password-visibility field using a synthetic example value. */
function PasswordToggleFieldPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <div className="study-stack">
            <label htmlFor={id}>Example password</label>
            <Primitives.unstable_PasswordToggleField.Root>
                <div className="primitive-row" data-treatment={treatment}>
                    <Primitives.unstable_PasswordToggleField.Input
                        id={id}
                        className="primitive-input"
                        defaultValue="example-only"
                        disabled={disabled}
                        autoComplete="new-password"
                    />
                    <Primitives.unstable_PasswordToggleField.Toggle className="primitive-toggle" disabled={disabled}>
                        <Primitives.unstable_PasswordToggleField.Slot visible="Hide password" hidden="Show password" />
                    </Primitives.unstable_PasswordToggleField.Toggle>
                </div>
            </Primitives.unstable_PasswordToggleField.Root>
            <p className="study-note">Preview API · use synthetic values only.</p>
        </div>
    );
}

/** Compares the two password toggle field preview candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <PasswordToggleFieldPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <PasswordToggleFieldPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the password toggle field preview study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Password toggle field preview',
    component: PasswordToggleFieldPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof PasswordToggleFieldPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive password toggle field preview specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <PasswordToggleFieldPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side password toggle field preview candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
