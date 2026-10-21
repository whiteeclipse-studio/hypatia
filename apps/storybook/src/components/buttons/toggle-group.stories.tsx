import type { Meta, StoryObj } from '@storybook/react-vite';

import { Primitives } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores toggle group with two provisional visual treatments. */
function ToggleGroupPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <Primitives.ToggleGroup.Root
            type="multiple"
            defaultValue={['bold']}
            className="primitive-row"
            aria-label="Text formatting"
            data-treatment={treatment}
        >
            <Primitives.ToggleGroup.Item value="bold" className="primitive-toggle" aria-label="Bold">B</Primitives.ToggleGroup.Item>
            <Primitives.ToggleGroup.Item value="italic" className="primitive-toggle" aria-label="Italic">I</Primitives.ToggleGroup.Item>
            <Primitives.ToggleGroup.Item value="underline" className="primitive-toggle" aria-label="Underline" disabled>U</Primitives.ToggleGroup.Item>
        </Primitives.ToggleGroup.Root>
    );
}

/** Compares the two toggle group candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <ToggleGroupPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <ToggleGroupPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the toggle group study and its candidate controls. */
const meta = {
    title: 'Components/Buttons/Toggle group',
    component: ToggleGroupPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof ToggleGroupPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive toggle group specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ToggleGroupPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side toggle group candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
