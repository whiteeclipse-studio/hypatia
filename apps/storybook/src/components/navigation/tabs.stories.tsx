import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'compact' | 'comfortable';
    disabled?: boolean;
};

/** Explores tabs with two provisional visual treatments. */
function TabsPreview({ treatment, disabled = false }: PreviewProps) {
    return (
        <Tabs.Root defaultValue="overview">
            <Tabs.List size={treatment === 'compact' ? '1' : '2'}>
                <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                <Tabs.Trigger value="details">Details</Tabs.Trigger>
                <Tabs.Trigger value="history" disabled>History</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="overview" className="study-padding">
                <Text>Explore the shared visual foundations.</Text>
            </Tabs.Content>
            <Tabs.Content value="details" className="study-padding">
                <Text>Components remain exploratory and unapproved.</Text>
            </Tabs.Content>
        </Tabs.Root>
    );
}

/** Compares the two tabs candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Compact tabs">
                <TabsPreview treatment="compact" />
            </Candidate>
            <Candidate title="Comfortable tabs">
                <TabsPreview treatment="comfortable" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the tabs study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Tabs',
    component: TabsPreview,
    args: { treatment: 'compact' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    },
} satisfies Meta<typeof TabsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive tabs specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TabsPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side tabs candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
