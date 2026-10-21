import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'soft' | 'outline';
};

/** Explores badge with two provisional visual treatments. */
function BadgePreview({ treatment }: PreviewProps) {
    return (
        <div className="study-row">
            <Badge variant={treatment}>Draft</Badge>
            <Badge variant={treatment} color="green">Ready</Badge>
            <Badge variant={treatment} color="red">Needs review</Badge>
        </div>
    );
}

/** Compares the two badge candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Soft">
                <BadgePreview treatment="soft" />
            </Candidate>
            <Candidate title="Outline">
                <BadgePreview treatment="outline" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the badge study and its candidate controls. */
const meta = {
    title: 'Components/Content/Badge',
    component: BadgePreview,
    args: { treatment: 'soft' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['soft', 'outline'] },
    },
} satisfies Meta<typeof BadgePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive badge specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <BadgePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side badge candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
