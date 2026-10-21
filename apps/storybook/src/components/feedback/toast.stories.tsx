import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Primitives, Button, Theme } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'solid' | 'outline';
};

/** Explores toast with two provisional visual treatments. */
function ToastPreview({ treatment }: PreviewProps) {
    const [open, setOpen] = useState(false);
    function notify() {
        setOpen(true);
    }

    return (
        <Primitives.Toast.Provider swipeDirection="right" duration={6000}>
            <Button variant={treatment} onClick={notify}>Save preview</Button>
            <Theme className="primitive-portal" hasBackground={false}>
                <Primitives.Toast.Root className="primitive-toast" data-treatment={treatment} open={open} onOpenChange={setOpen}>
                    <Primitives.Toast.Title>Preview saved</Primitives.Toast.Title>
                    <Primitives.Toast.Description>Demonstration state only. Nothing was persisted.</Primitives.Toast.Description>
                    <Primitives.Toast.Close asChild>
                        <Button variant="outline" size="1">Dismiss</Button>
                    </Primitives.Toast.Close>
                </Primitives.Toast.Root>
                <Primitives.Toast.Viewport className="primitive-toast-viewport" data-treatment={treatment} />
            </Theme>
        </Primitives.Toast.Provider>
    );
}

/** Compares the two toast candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Solid action">
                <ToastPreview treatment="solid" />
            </Candidate>
            <Candidate title="Outline action">
                <ToastPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the toast study and its candidate controls. */
const meta = {
    title: 'Components/Feedback/Toast',
    component: ToastPreview,
    args: { treatment: 'solid' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['solid', 'outline'] },
    },
} satisfies Meta<typeof ToastPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive toast specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ToastPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side toast candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
