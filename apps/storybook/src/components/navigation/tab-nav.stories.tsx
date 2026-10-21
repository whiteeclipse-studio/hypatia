import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { TabNav, Text } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'compact' | 'comfortable';
};

/** Explores tab nav with two provisional visual treatments. */
function TabNavPreview({ treatment }: PreviewProps) {
    const [page, setPage] = useState('overview');
    function openOverview(event: MouseEvent) {
        event.preventDefault();
        setPage('overview');
    }
    function openDetails(event: MouseEvent) {
        event.preventDefault();
        setPage('details');
    }

    return (
        <div className="study-stack">
            <TabNav.Root size={treatment === 'compact' ? '1' : '2'} aria-label="Sections">
                <TabNav.Link href="#overview" active={page === 'overview'} onClick={openOverview}>Overview</TabNav.Link>
                <TabNav.Link href="#details" active={page === 'details'} onClick={openDetails}>Details</TabNav.Link>
            </TabNav.Root>
            <Text as="p">Current section: {page}</Text>
        </div>
    );
}

/** Compares the two tab nav candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Compact navigation">
                <TabNavPreview treatment="compact" />
            </Candidate>
            <Candidate title="Comfortable navigation">
                <TabNavPreview treatment="comfortable" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the tab nav study and its candidate controls. */
const meta = {
    title: 'Components/Navigation/Tab nav',
    component: TabNavPreview,
    args: { treatment: 'compact' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    },
} satisfies Meta<typeof TabNavPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive tab nav specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TabNavPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side tab nav candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
