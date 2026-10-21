import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Dialog, Button, TextField, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
};

/** Explores dialog with two provisional visual treatments. */
function DialogPreview({ treatment }: PreviewProps) {
    const [status, setStatus] = useState('No changes saved.');
    function save() {
        setStatus('Preview saved.');
    }

    return (
        <div className="study-stack">
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button variant={treatment}>Edit display name</Button>
                </Dialog.Trigger>
                <Dialog.Content className="study-popup" data-treatment={treatment} maxWidth="420px">
                    <Dialog.Title>Edit display name</Dialog.Title>
                    <Dialog.Description mb="4">Changes apply to this preview only.</Dialog.Description>
                    <label className="study-stack">Display name<TextField.Root defaultValue="Example reader" aria-label="Display name" />
                    </label>
                    <div className="study-row study-end">
                        <Dialog.Close>
                            <Button variant="outline">Cancel</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                            <Button onClick={save}>Save preview</Button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Root>
            <Text as="p" role="status" size="2">{status}</Text>
        </div>
    );
}

/** Compares the two dialog candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid trigger">
                <DialogPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline trigger">
                <DialogPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the dialog study and its candidate controls. */
const meta = {
    title: 'Components/Overlays/Dialog',
    component: DialogPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
    },
} satisfies Meta<typeof DialogPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive dialog specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <DialogPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side dialog candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
