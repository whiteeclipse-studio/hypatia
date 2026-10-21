import type { Meta, StoryObj } from '@storybook/react-vite';

import { Primitives } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores accordion with two provisional visual treatments. */
function AccordionPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <Primitives.Accordion.Root
            type="single"
            collapsible
            defaultValue="purpose"
            className="primitive-accordion"
            data-treatment={treatment}
        >
            <Primitives.Accordion.Item value="purpose">
                <Primitives.Accordion.Header>
                    <Primitives.Accordion.Trigger className="primitive-trigger core-ui-disclosure-trigger">What is Core UI?</Primitives.Accordion.Trigger>
                </Primitives.Accordion.Header>
                <Primitives.Accordion.Content className="primitive-content">A shared visual and interaction foundation.</Primitives.Accordion.Content>
            </Primitives.Accordion.Item>
            <Primitives.Accordion.Item value="status">
                <Primitives.Accordion.Header>
                    <Primitives.Accordion.Trigger className="primitive-trigger core-ui-disclosure-trigger">Is this approved?</Primitives.Accordion.Trigger>
                </Primitives.Accordion.Header>
                <Primitives.Accordion.Content className="primitive-content">No. These are exploratory candidates.</Primitives.Accordion.Content>
            </Primitives.Accordion.Item>
            <Primitives.Accordion.Item value="release" disabled>
                <Primitives.Accordion.Header>
                    <Primitives.Accordion.Trigger className="primitive-trigger core-ui-disclosure-trigger">Release notes (unavailable)</Primitives.Accordion.Trigger>
                </Primitives.Accordion.Header>
                <Primitives.Accordion.Content>No release exists.</Primitives.Accordion.Content>
            </Primitives.Accordion.Item>
        </Primitives.Accordion.Root>
    );
}

/** Compares the two accordion candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <AccordionPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <AccordionPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the accordion study and its candidate controls. */
const meta = {
    title: 'Components/Disclosure/Accordion',
    component: AccordionPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof AccordionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive accordion specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <AccordionPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side accordion candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
