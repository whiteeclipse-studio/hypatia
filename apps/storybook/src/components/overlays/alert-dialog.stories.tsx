import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AlertDialog, Button, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
};

/** Explores alert dialog with two provisional visual treatments. */
function AlertDialogPreview({ treatment }: PreviewProps) {
    const [status, setStatus] = useState('Preview unchanged.');
    function reset() {
        setStatus('Preview reset.');
    }

    return (
        <div className="study-stack">
            <AlertDialog.Root>
                <AlertDialog.Trigger>
                    <Button variant={treatment} color="red">Reset preview</Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content className="study-popup" data-treatment={treatment} maxWidth="420px">
                    <AlertDialog.Title>Reset this preview?</AlertDialog.Title>
                    <AlertDialog.Description mb="4">This only changes demonstration state. No files or settings are removed.</AlertDialog.Description>
                    <div className="study-row study-end">
                        <AlertDialog.Cancel>
                            <Button variant="outline">Keep preview</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button color="red" onClick={reset}>Reset preview</Button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Root>
            <Text as="p" role="status" size="2">{status}</Text>
        </div>
    );
}

/** Compares the two alert dialog candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid trigger">
                <AlertDialogPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline trigger">
                <AlertDialogPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the alert dialog study and its candidate controls. */
const meta = {
    title: 'Components/Overlays/Alert dialog',
    component: AlertDialogPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
    },
} satisfies Meta<typeof AlertDialogPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive alert dialog specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <AlertDialogPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side alert dialog candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
