import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckboxCards } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'classic';
    disabled?: boolean;
};

/** Explores checkbox cards with two provisional visual treatments. */
function CheckboxCardsPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <CheckboxCards.Root
            defaultValue={['docs']}
            variant={treatment}
            disabled={disabled}
            aria-label="Project interests"
        >
            <CheckboxCards.Item value="docs">Documentation</CheckboxCards.Item>
            <CheckboxCards.Item value="design">Design systems</CheckboxCards.Item>
            <CheckboxCards.Item value="archive" disabled>Archive (unavailable)</CheckboxCards.Item>
        </CheckboxCards.Root>
    );
}

/** Compares the two checkbox cards candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <CheckboxCardsPreview treatment="surface" />
            </Candidate>
            <Candidate title="Classic">
                <CheckboxCardsPreview treatment="classic" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the checkbox cards study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Checkbox cards',
    component: CheckboxCardsPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'classic'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof CheckboxCardsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive checkbox cards specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <CheckboxCardsPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side checkbox cards candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
