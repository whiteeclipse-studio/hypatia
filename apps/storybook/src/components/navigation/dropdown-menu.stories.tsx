import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DropdownMenu, Button, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
    disabled?: boolean;
};

/** Explores dropdown menu with two provisional visual treatments. */
function DropdownMenuPreview({ treatment, disabled = false }: PreviewProps) {
    const [status, setStatus] = useState('No action selected.');
    const [bookmarked, setBookmarked] = useState(false);
    function preview() {
        setStatus('Preview action selected.');
    }

    return (
        <div className="study-stack">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant={treatment}>Document actions<DropdownMenu.TriggerIcon />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Label>Local preview actions</DropdownMenu.Label>
                    <DropdownMenu.Item onSelect={preview}>Preview document</DropdownMenu.Item>
                    <DropdownMenu.CheckboxItem checked={bookmarked} onCheckedChange={setBookmarked}>Bookmark</DropdownMenu.CheckboxItem>
                    <DropdownMenu.Sub>
                        <DropdownMenu.SubTrigger>Reading mode</DropdownMenu.SubTrigger>
                        <DropdownMenu.SubContent>
                            <DropdownMenu.Item>Comfortable</DropdownMenu.Item>
                            <DropdownMenu.Item>Compact</DropdownMenu.Item>
                        </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item disabled>Publish (unavailable)</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Text as="p" role="status" size="2">{status}</Text>
        </div>
    );
}

/** Compares the two dropdown menu candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid trigger">
                <DropdownMenuPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline trigger">
                <DropdownMenuPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the dropdown menu study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Dropdown menu',
    component: DropdownMenuPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
    },
} satisfies Meta<typeof DropdownMenuPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive dropdown menu specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <DropdownMenuPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side dropdown menu candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
