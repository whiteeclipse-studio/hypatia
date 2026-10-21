import type { Meta, StoryObj } from '@storybook/react-vite';

import { AspectRatio } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'wide' | 'square';
};

/** Explores aspect ratio with two provisional visual treatments. */
function AspectRatioPreview({ treatment }: PreviewProps) {
    return (
        <AspectRatio ratio={treatment === 'wide' ? 16 / 9 : 1}>
            <div className="study-aspect">Original placeholder / {treatment}</div>
        </AspectRatio>
    );
}

/** Compares the two aspect ratio candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="16:9">
                <AspectRatioPreview treatment="wide" />
            </Candidate>
            <Candidate title="1:1">
                <AspectRatioPreview treatment="square" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the aspect ratio study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Aspect ratio',
    component: AspectRatioPreview,
    args: { treatment: 'wide' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['wide', 'square'] },
    },
} satisfies Meta<typeof AspectRatioPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive aspect ratio specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <AspectRatioPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side aspect ratio candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
