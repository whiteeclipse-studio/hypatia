import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Primitives } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores the unstable segmented code field without authentication or automatic submission. */
function OneTimePasswordFieldPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <div className="study-stack">
            <p id={id}>Example verification code</p>
            <Primitives.unstable_OneTimePasswordField.Root
                className="primitive-row"
                data-treatment={treatment}
                aria-labelledby={id}
                disabled={disabled}
                autoComplete="off"
            >
                <Primitives.unstable_OneTimePasswordField.Input index={0} className="primitive-code-input" aria-label="Code digit 1" />
                <Primitives.unstable_OneTimePasswordField.Input index={1} className="primitive-code-input" aria-label="Code digit 2" />
                <Primitives.unstable_OneTimePasswordField.Input index={2} className="primitive-code-input" aria-label="Code digit 3" />
                <Primitives.unstable_OneTimePasswordField.Input index={3} className="primitive-code-input" aria-label="Code digit 4" />
                <Primitives.unstable_OneTimePasswordField.HiddenInput />
            </Primitives.unstable_OneTimePasswordField.Root>
            <p className="study-note">Preview API · no real code is requested or verified.</p>
        </div>
    );
}

/** Compares the two one-time password field preview candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <OneTimePasswordFieldPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <OneTimePasswordFieldPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the one-time password field preview study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/One-time password field preview',
    component: OneTimePasswordFieldPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof OneTimePasswordFieldPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive one-time password field preview specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <OneTimePasswordFieldPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side one-time password field preview candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
