import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataList } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'horizontal' | 'vertical';
};

/** Explores data list with two provisional visual treatments. */
function DataListPreview({ treatment }: PreviewProps) {
    return (
        <DataList.Root orientation={treatment}>
            <DataList.Item>
                <DataList.Label>Status</DataList.Label>
                <DataList.Value>Exploratory</DataList.Value>
            </DataList.Item>
            <DataList.Item>
                <DataList.Label>Package</DataList.Label>
                <DataList.Value>Core UI</DataList.Value>
            </DataList.Item>
            <DataList.Item>
                <DataList.Label>Audience</DataList.Label>
                <DataList.Value>Design reviewers</DataList.Value>
            </DataList.Item>
        </DataList.Root>
    );
}

/** Compares the two data list candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Horizontal">
                <DataListPreview treatment="horizontal" />
            </Candidate>
            <Candidate title="Vertical">
                <DataListPreview treatment="vertical" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the data list study and its candidate controls. */
const meta = {
    title: 'Components/Content/Data list',
    component: DataListPreview,
    args: { treatment: 'horizontal' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    },
} satisfies Meta<typeof DataListPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive data list specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <DataListPreview {...args} />
        </StudyFrame>,
};

/** Side-by-side data list candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
