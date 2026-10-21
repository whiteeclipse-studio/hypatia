import type { Meta, StoryObj } from '@storybook/react-vite';

import { Theme, ThemePanel, Button } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'gray' | 'bronze';
};

/** Explores a local theme inspector; changes are scoped to the specimen, not the shared design. */
function ThemePanelPreview({ treatment }: PreviewProps) {
    return (
        <Theme accentColor={treatment} radius="none" className="study-nested-theme">
            <Button>Theme preview</Button>
            <ThemePanel
                defaultOpen
                style={{ position: 'relative', top: 0, right: 0, margin: 0, maxHeight: 480, width: '100%' }}
            />
        </Theme>
    );
}

/** Compares the two theme panel candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Neutral accent">
                <ThemePanelPreview treatment="gray" />
            </Candidate>
            <Candidate title="Bronze accent">
                <ThemePanelPreview treatment="bronze" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the theme panel study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Theme panel',
    component: ThemePanelPreview,
    args: { treatment: 'gray' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['gray', 'bronze'] },
    },
} satisfies Meta<typeof ThemePanelPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive theme panel specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ThemePanelPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side theme panel candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
