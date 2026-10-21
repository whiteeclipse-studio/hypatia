import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Slider, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'soft';
    disabled?: boolean;
};

/** Explores slider with two provisional visual treatments. */
function SliderPreview({ treatment, disabled = false }: PreviewProps) {
    const [value, setValue] = useState([100]);

    return (
        <div className="study-stack">
            <Text as="p">Preview scale: {value[0]}%</Text>
            <Slider
                aria-label="Preview scale"
                value={value}
                onValueChange={setValue}
                min={50}
                max={150}
                step={5}
                variant={treatment}
                disabled={disabled}
            />
            <Text as="p" size="2">Range</Text>
            <Slider aria-label="Visible range" defaultValue={[20, 80]} variant={treatment} disabled={disabled} />
        </div>
    );
}

/** Compares the two slider candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <SliderPreview treatment="surface" />
            </Candidate>
            <Candidate title="Soft">
                <SliderPreview treatment="soft" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the slider study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Slider',
    component: SliderPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'soft'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof SliderPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive slider specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SliderPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side slider candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
