import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEvent } from 'react';

import { Slot, Slottable } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate, ArrowIcon } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
};

/** Explores slot with two provisional visual treatments. */
function SlotPreview({ treatment }: PreviewProps) {
    function activate(event: MouseEvent<HTMLButtonElement>) {
        event.currentTarget.focus();
    }

    return (
        <Slot className="primitive-slotted" data-treatment={treatment}>
            <button type="button" onClick={activate}>
                <ArrowIcon />
                <Slottable>Open preview</Slottable>
            </button>
        </Slot>
    );
}

/** Compares the two slot candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <SlotPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <SlotPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the slot study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Slot',
    component: SlotPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof SlotPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive slot specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <SlotPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side slot candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
