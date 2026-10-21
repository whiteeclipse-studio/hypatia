import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'surface' | 'ghost';
};

/** Explores table with two provisional visual treatments. */
function TablePreview({ treatment }: PreviewProps) {
    return (
        <Table.Root variant={treatment}>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Component</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.RowHeaderCell>Button</Table.RowHeaderCell>
                    <Table.Cell>Exploratory</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.RowHeaderCell>Checkbox</Table.RowHeaderCell>
                    <Table.Cell>Exploratory</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table.Root>
    );
}

/** Compares the two table candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Surface">
                <TablePreview treatment="surface" />
            </Candidate>
            <Candidate title="Ghost">
                <TablePreview treatment="ghost" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the table study and its candidate controls. */
const meta = {
    title: 'Components/Content/Table',
    component: TablePreview,
    args: { treatment: 'surface' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['surface', 'ghost'] },
    },
} satisfies Meta<typeof TablePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive table specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <TablePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side table candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
