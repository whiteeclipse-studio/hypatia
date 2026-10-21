import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'soft' | 'solid';
};

/** Explores avatar with two provisional visual treatments. */
function AvatarPreview({ treatment }: PreviewProps) {
    return (
        <div className="study-row">
            <Avatar fallback="WE" size="5" variant={treatment} aria-label="White Eclipse" />
            <Avatar fallback="A" size="3" variant={treatment} aria-label="Example author" />
        </div>
    );
}

/** Compares the two avatar candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Soft fallback">
                <AvatarPreview treatment="soft" />
            </Candidate>
            <Candidate title="Solid fallback">
                <AvatarPreview treatment="solid" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the avatar study and its candidate controls. */
const meta = {
    title: 'Components/Content/Avatar',
    component: AvatarPreview,
    args: { treatment: 'soft' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['soft', 'solid'] },
    },
} satisfies Meta<typeof AvatarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive avatar specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <AvatarPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side avatar candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
