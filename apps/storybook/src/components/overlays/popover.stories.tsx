import type { Meta, StoryObj } from '@storybook/react-vite';

import { Popover, Button, Checkbox, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
};

/** Explores popover with two provisional visual treatments. */
function PopoverPreview({ treatment }: PreviewProps) {
    return (
        <Popover.Root>
            <Popover.Trigger>
                <Button variant={treatment}>Reading options</Button>
            </Popover.Trigger>
            <Popover.Content className="study-popup" data-treatment={treatment} width="280px">
                <div className="study-stack">
                    <Text as="p" weight="bold">Reading options</Text>
                    <label className="study-row">
                        <Checkbox defaultChecked /> Show progress</label>
                    <Popover.Close>
                        <Button variant="outline">Done</Button>
                    </Popover.Close>
                </div>
            </Popover.Content>
        </Popover.Root>
    );
}

/** Compares the two popover candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid trigger">
                <PopoverPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline trigger">
                <PopoverPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the popover study and its candidate controls. */
const meta = {
    title: 'Components/Overlays/Popover',
    component: PopoverPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
    },
} satisfies Meta<typeof PopoverPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive popover specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <PopoverPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side popover candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
