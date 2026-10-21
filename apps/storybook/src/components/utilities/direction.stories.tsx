import type { Meta, StoryObj } from '@storybook/react-vite';

import { Primitives, Slider, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'ltr' | 'rtl';
};

/** Explores direction provider with two provisional visual treatments. */
function DirectionPreview({ treatment }: PreviewProps) {
    return (
        <Primitives.Direction.Provider dir={treatment}>
            <div dir={treatment} className="study-stack">
                <Text as="p">Reading direction: {treatment}</Text>
                <Slider aria-label="Direction-aware scale" defaultValue={[35]} />
            </div>
        </Primitives.Direction.Provider>
    );
}

/** Compares the two direction provider candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Left to right">
                <DirectionPreview treatment="ltr" />
            </Candidate>
            <Candidate title="Right to left">
                <DirectionPreview treatment="rtl" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the direction provider study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Direction provider',
    component: DirectionPreview,
    args: { treatment: 'ltr' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['ltr', 'rtl'] },
    },
} satisfies Meta<typeof DirectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive direction provider specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <DirectionPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side direction provider candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
