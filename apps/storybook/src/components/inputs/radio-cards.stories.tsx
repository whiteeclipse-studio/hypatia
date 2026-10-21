import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioCards } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'classic';
    disabled?: boolean;
};

/** Explores radio cards with two provisional visual treatments. */
function RadioCardsPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <RadioCards.Root defaultValue="personal" variant={treatment} disabled={disabled} aria-label="Workspace type">
            <RadioCards.Item value="personal">Personal workspace</RadioCards.Item>
            <RadioCards.Item value="shared">Shared workspace</RadioCards.Item>
            <RadioCards.Item value="managed" disabled>Managed (unavailable)</RadioCards.Item>
        </RadioCards.Root>
    );
}

/** Compares the two radio cards candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <RadioCardsPreview treatment="surface" />
            </Candidate>
            <Candidate title="Classic">
                <RadioCardsPreview treatment="classic" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the radio cards study and its candidate controls. */
const meta = {
    title: 'Components/Inputs/Radio cards',
    component: RadioCardsPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'classic'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof RadioCardsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive radio cards specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <RadioCardsPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side radio cards candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
