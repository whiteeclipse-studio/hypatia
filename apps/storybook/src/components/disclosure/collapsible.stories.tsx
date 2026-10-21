import type { Meta, StoryObj } from '@storybook/react-vite';

import { Primitives, Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
};

/** Explores collapsible with two provisional visual treatments. */
function CollapsiblePreview({ treatment }: PreviewProps) {
    return (
        <Primitives.Collapsible.Root className="primitive-collapsible" data-treatment={treatment}>
            <Primitives.Collapsible.Trigger asChild>
                <Button variant="outline" className="core-ui-disclosure-trigger">Show supporting notes</Button>
            </Primitives.Collapsible.Trigger>
            <Primitives.Collapsible.Content className="primitive-content">These local notes can be expanded without leaving the page.</Primitives.Collapsible.Content>
        </Primitives.Collapsible.Root>
    );
}

/** Compares the two collapsible candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <CollapsiblePreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <CollapsiblePreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the collapsible study and its candidate controls. */
const meta = {
    title: 'Components/Disclosure/Collapsible',
    component: CollapsiblePreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof CollapsiblePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive collapsible specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <CollapsiblePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side collapsible candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
