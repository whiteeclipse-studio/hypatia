import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { TextArea, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'soft';
    disabled?: boolean;
};

/** Explores text area with two provisional visual treatments. */
function TextAreaPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <div className="study-stack">
            <label htmlFor={id}>Project description</label>
            <TextArea
                id={id}
                placeholder="Describe your idea…"
                rows={4}
                variant={treatment}
                disabled={disabled}
                aria-describedby={`${id}-hint`}
            />
            <Text id={`${id}-hint`} as="p" size="2" color="gray">Keep the description concise.</Text>
            <TextArea
                aria-label="Read-only description"
                value="An exploratory component catalogue."
                readOnly
                variant={treatment}
            />
        </div>
    );
}

/** Compares the two text area candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <TextAreaPreview treatment="surface" />
            </Candidate>
            <Candidate title="Soft">
                <TextAreaPreview treatment="soft" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the text area study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Text area',
    component: TextAreaPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'soft'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof TextAreaPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive text area specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TextAreaPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side text area candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
