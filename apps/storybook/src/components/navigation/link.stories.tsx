import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Link } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'always' | 'hover';
};

/** Explores link with two provisional visual treatments. */
function LinkPreview({ treatment }: PreviewProps) {
    const noteId = useId();

    return (
        <div className="study-stack">
            <Link href={`#${noteId}`} underline={treatment}>Read the local note</Link>
            <p id={noteId}>This anchor stays inside the preview.</p>
        </div>
    );
}

/** Compares the two link candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Always underlined">
                <LinkPreview treatment="always" />
            </Candidate>
            <Candidate title="Underline on hover">
                <LinkPreview treatment="hover" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the link study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Link',
    component: LinkPreview,
    args: { treatment: 'always' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['always', 'hover'] },
    },
} satisfies Meta<typeof LinkPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive link specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <LinkPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side link candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
