import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollArea, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'always' | 'hover';
};

/** Explores scroll area with two provisional visual treatments. */
function ScrollAreaPreview({ treatment }: PreviewProps) {
    return (
        <ScrollArea type={treatment} scrollbars="vertical" style={{ height: 180 }}>
            <div className="study-stack study-padding">
                <Text as="p">A readable introduction to the component catalogue.</Text>
                <Text as="p">The viewport constrains this content while preserving keyboard and pointer scrolling.</Text>
                <Text as="p">Each component has a focused role, a clear name, and consistent interaction.</Text>
                <Text as="p">Long content remains available without expanding the surrounding comparison.</Text>
                <Text as="p">End of the scrollable example.</Text>
            </div>
        </ScrollArea>
    );
}

/** Compares the two scroll area candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Persistent scrollbar">
                <ScrollAreaPreview treatment="always" />
            </Candidate>
            <Candidate title="Scrollbar on hover">
                <ScrollAreaPreview treatment="hover" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the scroll area study and its candidate controls. */
const meta = {
    title: 'Components/Content/Scroll area',
    component: ScrollAreaPreview,
    args: { treatment: 'always' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['always', 'hover'] },
    },
} satisfies Meta<typeof ScrollAreaPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive scroll area specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ScrollAreaPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side scroll area candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
