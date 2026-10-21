import type { Meta, StoryObj } from '@storybook/react-vite';

import { Theme, Button, Text, useThemeContext } from '@whiteeclipse/core-ui';
import { StudyFrame, Candidate } from '../study';

type PreviewProps = {
    treatment: 'light' | 'dark';
};

/** Describes the active theme context inside a nested boundary. */
function ThemeSummary() {
    const theme = useThemeContext();

    return <Text as="p" size="2">{theme.appearance} appearance · {theme.accentColor} accent</Text>;
}

/** Explores theme with two provisional visual treatments. */
function ThemePreview({ treatment }: PreviewProps) {
    return (
        <Theme
            appearance={treatment}
            accentColor="gray"
            grayColor="sand"
            radius="none"
            className="study-nested-theme"
        >
            <div className="study-stack study-padding">
                <Text as="p">Nested theme boundary</Text>
                <ThemeSummary />
                <Button>Continue</Button>
            </div>
        </Theme>
    );
}

/** Compares the two theme candidates with the same illustrative content. */
function ComparisonPreview() {
    return (
        <StudyFrame>
            <Candidate title="Light boundary">
                <ThemePreview treatment="light" />
            </Candidate>
            <Candidate title="Dark boundary">
                <ThemePreview treatment="dark" />
            </Candidate>
        </StudyFrame>
    );
}

/** Registers the theme study and its candidate controls. */
const meta = {
    title: 'Components/Utilities/Theme',
    component: ThemePreview,
    args: { treatment: 'light' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['light', 'dark'] },
    },
} satisfies Meta<typeof ThemePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive theme specimen for exploring the selected candidate. */
export const Playground: Story = {
    render: (args) =>
        <StudyFrame>
            <ThemePreview {...args} />
        </StudyFrame>,
};

/** Side-by-side theme candidates for design review. */
export const Comparison: Story = {
    parameters: { controls: { disable: true } },
    render: () =>
        <ComparisonPreview />,
};
