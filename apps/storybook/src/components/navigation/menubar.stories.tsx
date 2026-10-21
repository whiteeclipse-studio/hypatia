import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Primitives, Theme } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
    disabled?: boolean;
};

/** Explores menubar with two provisional visual treatments. */
function MenubarPreview({ treatment, disabled = false }: PreviewProps) {
    const [guides, setGuides] = useState(true);
    function select() {
        setGuides(false);
    }

    return (
        <Primitives.Menubar.Root className="primitive-row" aria-label="Application menu">
            <Primitives.Menubar.Menu>
                <Primitives.Menubar.Trigger className="primitive-toggle">File</Primitives.Menubar.Trigger>
                <Primitives.Menubar.Portal>
                    <Theme className="primitive-portal" hasBackground={false}>
                        <Primitives.Menubar.Content className="primitive-popup" data-treatment={treatment} sideOffset={8}>
                            <Primitives.Menubar.Item className="primitive-menu-item" onSelect={select}>New preview</Primitives.Menubar.Item>
                            <Primitives.Menubar.Separator className="primitive-rule" />
                            <Primitives.Menubar.Item className="primitive-menu-item" disabled>Publish (unavailable)</Primitives.Menubar.Item>
                        </Primitives.Menubar.Content>
                    </Theme>
                </Primitives.Menubar.Portal>
            </Primitives.Menubar.Menu>
            <Primitives.Menubar.Menu>
                <Primitives.Menubar.Trigger className="primitive-toggle">View</Primitives.Menubar.Trigger>
                <Primitives.Menubar.Portal>
                    <Theme className="primitive-portal" hasBackground={false}>
                        <Primitives.Menubar.Content className="primitive-popup" data-treatment={treatment} sideOffset={8}>
                            <Primitives.Menubar.CheckboxItem className="primitive-menu-item" checked={guides} onCheckedChange={setGuides}>Show guides<Primitives.Menubar.ItemIndicator> ✓</Primitives.Menubar.ItemIndicator>
                            </Primitives.Menubar.CheckboxItem>
                        </Primitives.Menubar.Content>
                    </Theme>
                </Primitives.Menubar.Portal>
            </Primitives.Menubar.Menu>
        </Primitives.Menubar.Root>
    );
}

/** Compares the two menubar candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <MenubarPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <MenubarPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the menubar study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Menubar',
    component: MenubarPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof MenubarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive menubar specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <MenubarPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side menubar candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
