import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { Primitives } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
};

/** Explores toolbar with two provisional visual treatments. */
function ToolbarPreview({ treatment }: PreviewProps) {
    const noteId = useId();
    const [status, setStatus] = useState('No action selected.');
    function announce() {
        setStatus('Preview action selected.');
    }

    return (
        <Primitives.Toolbar.Root className="primitive-row" aria-label="Editor tools" data-treatment={treatment}>
            <Primitives.Toolbar.Button className="primitive-toggle" onClick={announce}>Preview</Primitives.Toolbar.Button>
            <Primitives.Toolbar.Separator className="primitive-separator" />
            <Primitives.Toolbar.ToggleGroup type="multiple" aria-label="Formatting">
                <Primitives.Toolbar.ToggleItem value="bold" className="primitive-toggle" aria-label="Bold">B</Primitives.Toolbar.ToggleItem>
                <Primitives.Toolbar.ToggleItem value="italic" className="primitive-toggle" aria-label="Italic">I</Primitives.Toolbar.ToggleItem>
            </Primitives.Toolbar.ToggleGroup>
            <Primitives.Toolbar.Link href={`#${noteId}`} className="primitive-link">Help</Primitives.Toolbar.Link>
            <span id={noteId} role="status">{status}</span>
        </Primitives.Toolbar.Root>
    );
}

/** Compares the two toolbar candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <ToolbarPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <ToolbarPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the toolbar study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Toolbar',
    component: ToolbarPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof ToolbarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive toolbar specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ToolbarPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side toolbar candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
