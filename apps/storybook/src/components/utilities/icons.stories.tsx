import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChevronDownIcon, ThickCheckIcon, ThickChevronRightIcon, ThickDividerHorizontalIcon } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'normal' | 'muted';
};

/** Explores icons with two provisional visual treatments. */
function IconsPreview({ treatment }: PreviewProps) {
    return (
        <div
            className="study-row study-icon-set"
            data-treatment={treatment}
            role="img"
            aria-label="Chevron down, check, chevron right, and divider"
        >
            <ChevronDownIcon />
            <ThickCheckIcon />
            <ThickChevronRightIcon />
            <ThickDividerHorizontalIcon />
        </div>
    );
}

/** Compares the two icons candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Foreground">
                <IconsPreview treatment="normal" />
            </Candidate>
            <Candidate title="Secondary foreground">
                <IconsPreview treatment="muted" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the icons study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Icons',
    component: IconsPreview,
    args: { treatment: 'normal' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['normal', 'muted'] },
    },
} satisfies Meta<typeof IconsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive icons specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <IconsPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side icons candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
