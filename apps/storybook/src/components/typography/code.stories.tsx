import type { Meta, StoryObj } from '@storybook/react-vite';

import { Code } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'soft' | 'outline';
};

/** Explores code with two provisional visual treatments. */
function CodePreview({ treatment }: PreviewProps) {
    return (
        <p>Start the catalogue with <Code variant={treatment}>bun run storybook</Code>.</p>
    );
}

/** Compares the two code candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Soft">
                <CodePreview treatment="soft" />
            </Candidate>
            <Candidate title="Outline">
                <CodePreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the code study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Code',
    component: CodePreview,
    args: { treatment: 'soft' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['soft', 'outline'] },
    },
} satisfies Meta<typeof CodePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive code specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <CodePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side code candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
