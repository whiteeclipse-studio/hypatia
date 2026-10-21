import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'editorial' | 'interface';
};

/** Explores heading with two provisional visual treatments. */
function HeadingPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-stack">
            <Heading
                as="h3"
                size={treatment === 'editorial' ? '7' : '5'}
                weight={treatment === 'editorial' ? 'regular' : 'bold'}
            >A clearer perspective</Heading>
            <Heading as="h4" size="3">A supporting section</Heading>
        </div>
    );
}

/** Compares the two heading candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Editorial">
                <HeadingPreview treatment="editorial" />
            </Candidate>
            <Candidate title="Interface">
                <HeadingPreview treatment="interface" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the heading study and its candidate controls. */
const meta = {
    title: 'Components/Typography/Heading',
    component: HeadingPreview,
    args: { treatment: 'editorial' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['editorial', 'interface'] },
    },
} satisfies Meta<typeof HeadingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive heading specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <HeadingPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side heading candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
