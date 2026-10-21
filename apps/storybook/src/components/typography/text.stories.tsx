import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'body' | 'compact';
};

/** Explores text with two provisional visual treatments. */
function TextPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-stack">
            <Text as="p" size={treatment === 'body' ? '4' : '2'}>Readable content is the foundation of the interface.</Text>
            <Text as="p" size="2" color="gray">Secondary information supports the main message.</Text>
        </div>
    );
}

/** Compares the two text candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Body text">
                <TextPreview treatment="body" />
            </Candidate>
            <Candidate title="Compact text">
                <TextPreview treatment="compact" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the text study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Text',
    component: TextPreview,
    args: { treatment: 'body' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['body', 'compact'] },
    },
} satisfies Meta<typeof TextPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive text specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TextPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side text candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
