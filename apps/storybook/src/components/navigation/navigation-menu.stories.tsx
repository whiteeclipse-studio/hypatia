import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { Primitives } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'outline';
};

/** Explores navigation menu with two provisional visual treatments. */
function NavigationMenuPreview({ treatment }: PreviewProps) {
    const projectId = useId();
    const aboutId = useId();

    return (
        <Primitives.NavigationMenu.Root className="primitive-navigation" aria-label="Project navigation">
            <Primitives.NavigationMenu.List className="primitive-row">
                <Primitives.NavigationMenu.Item>
                    <Primitives.NavigationMenu.Trigger className="primitive-toggle">Projects</Primitives.NavigationMenu.Trigger>
                    <Primitives.NavigationMenu.Content className="primitive-popup" data-treatment={treatment}>
                        <Primitives.NavigationMenu.Link className="primitive-link" href={`#${projectId}`}>Hypatia</Primitives.NavigationMenu.Link>
                        <p id={projectId}>Shared knowledge and documentation.</p>
                    </Primitives.NavigationMenu.Content>
                </Primitives.NavigationMenu.Item>
                <Primitives.NavigationMenu.Item>
                    <Primitives.NavigationMenu.Link className="primitive-link" href={`#${aboutId}`}>About</Primitives.NavigationMenu.Link>
                </Primitives.NavigationMenu.Item>
            </Primitives.NavigationMenu.List>
            <p id={aboutId}>Local navigation preview.</p>
        </Primitives.NavigationMenu.Root>
    );
}

/** Compares the two navigation menu candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <NavigationMenuPreview treatment="surface" />
            </Candidate>
            <Candidate title="Outline">
                <NavigationMenuPreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the navigation menu study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Navigation menu',
    component: NavigationMenuPreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'outline'] },
    },
} satisfies Meta<typeof NavigationMenuPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive navigation menu specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <NavigationMenuPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side navigation menu candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
