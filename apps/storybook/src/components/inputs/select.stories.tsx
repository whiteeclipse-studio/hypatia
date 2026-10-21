import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Select } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'soft';
    disabled?: boolean;
};

/** Explores select with two provisional visual treatments. */
function SelectPreview({ treatment, disabled = false }: PreviewProps) {
    const id = useId();

    return (
        <div className="study-stack">
            <label htmlFor={id}>Reading density</label>
            <Select.Root defaultValue="comfortable" disabled={disabled}>
                <Select.Trigger id={id} variant={treatment} placeholder="Choose density" />
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Available densities</Select.Label>
                        <Select.Item value="compact">Compact</Select.Item>
                        <Select.Item value="comfortable">Comfortable</Select.Item>
                        <Select.Item value="automatic" disabled>Automatic (unavailable)</Select.Item>
                        <Select.Item value="spacious">Spacious</Select.Item>
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
    );
}

/** Compares the two select candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <SelectPreview treatment="surface" />
            </Candidate>
            <Candidate title="Soft">
                <SelectPreview treatment="soft" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the select study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Select',
    component: SelectPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'soft'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof SelectPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive select specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SelectPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side select candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
