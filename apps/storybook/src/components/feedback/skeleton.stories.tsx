import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'loading' | 'ready';
};

/** Explores skeleton with two provisional visual treatments. */
function SkeletonPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-stack" aria-busy={treatment === 'loading'}>
            <Skeleton loading={treatment === 'loading'}>
                <Text as="p">A short project summary.</Text>
            </Skeleton>
            <Skeleton loading={treatment === 'loading'} height="80px">
                <div className="study-panel">Content ready</div>
            </Skeleton>
        </div>
    );
}

/** Compares the two skeleton candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Loading">
                <SkeletonPreview treatment="loading" />
            </Candidate>
            <Candidate title="Ready">
                <SkeletonPreview treatment="ready" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the skeleton study and its candidate controls. */
const meta = {
    title: 'Components/Feedback/Skeleton',
    component: SkeletonPreview,
    args: { treatment: 'loading' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['loading', 'ready'] },
    },
} satisfies Meta<typeof SkeletonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive skeleton specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SkeletonPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side skeleton candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
