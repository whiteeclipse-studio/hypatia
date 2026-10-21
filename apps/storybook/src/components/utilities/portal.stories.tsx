import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Portal, Theme, Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
};

/** Explores portal with two provisional visual treatments. */
function PortalPreview({ treatment }: PreviewProps) {
    const [host, setHost] = useState<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    function toggle() {
        setVisible(!visible);
    }

    return (
        <div className="study-stack">
            <Button variant="outline" onClick={toggle}>Toggle portalled note</Button>
            <Portal container={host}>
                <Theme className="primitive-portal" hasBackground={false}>
                    <div className="study-panel" data-treatment={treatment} hidden={!visible}>This note is rendered into the labelled host below.</div>
                </Theme>
            </Portal>
            <div ref={setHost} className="study-portal-host" aria-label="Portal host" />
        </div>
    );
}

/** Compares the two portal candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <PortalPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <PortalPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the portal study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Portal',
    component: PortalPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof PortalPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive portal specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <PortalPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side portal candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
