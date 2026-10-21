import type { Meta, StoryObj } from '@storybook/react-vite';

import { Container } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'narrow' | 'wide';
};

/** Explores container with two provisional visual treatments. */
function ContainerPreview({ treatment }: PreviewProps) {
    return (
        <Container size={treatment === 'narrow' ? '1' : '2'} className="study-panel">A centred reading container whose width is bounded by the available canvas.</Container>
    );
}

/** Compares the two container candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Narrow container">
                <ContainerPreview treatment="narrow" />
            </Candidate>
            <Candidate title="Wide container">
                <ContainerPreview treatment="wide" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the container study and its candidate controls. */
const meta = {
    title: 'Components/Layout/Container',
    component: ContainerPreview,
    args: { treatment: 'narrow' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['narrow', 'wide'] },
    },
} satisfies Meta<typeof ContainerPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive container specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ContainerPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side container candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
