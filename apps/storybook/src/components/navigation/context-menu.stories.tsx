import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ContextMenu, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores context menu with two provisional visual treatments. */
function ContextMenuPreview({ treatment, disabled = false }: PreviewProps) {
    const [pinned, setPinned] = useState(false);
    const [status, setStatus] = useState('No action selected.');
    function copy() {
        setStatus('Copy action selected; the clipboard is unchanged.');
    }

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <div className="study-context-target" data-treatment={treatment} tabIndex={0}>Right-click here, or use the context-menu keyboard shortcut.</div>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item onSelect={copy}>Copy example title</ContextMenu.Item>
                <ContextMenu.CheckboxItem checked={pinned} onCheckedChange={setPinned}>Pinned</ContextMenu.CheckboxItem>
                <ContextMenu.Separator />
                <ContextMenu.Item disabled>Delete (unavailable)</ContextMenu.Item>
            </ContextMenu.Content>
            <Text as="p" role="status" size="2">{status}</Text>
        </ContextMenu.Root>
    );
}

/** Compares the two context menu candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <ContextMenuPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <ContextMenuPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the context menu study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Context menu',
    component: ContextMenuPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof ContextMenuPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive context menu specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ContextMenuPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side context menu candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
