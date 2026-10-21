import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckboxGroup } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'soft';
    disabled?: boolean;
};

/** Explores checkbox group with two provisional visual treatments. */
function CheckboxGroupPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <CheckboxGroup.Root
            defaultValue={['reading']}
            variant={treatment}
            disabled={disabled}
            aria-label="Enabled features"
        >
            <CheckboxGroup.Item value="reading">Reading progress</CheckboxGroup.Item>
            <CheckboxGroup.Item value="bookmarks">Bookmarks</CheckboxGroup.Item>
            <CheckboxGroup.Item value="sync" disabled>Cloud sync (unavailable)</CheckboxGroup.Item>
        </CheckboxGroup.Root>
    );
}

/** Compares the two checkbox group candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <CheckboxGroupPreview treatment="surface" />
            </Candidate>
            <Candidate title="Soft">
                <CheckboxGroupPreview treatment="soft" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the checkbox group study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Checkbox group',
    component: CheckboxGroupPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'soft'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof CheckboxGroupPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive checkbox group specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <CheckboxGroupPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side checkbox group candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
