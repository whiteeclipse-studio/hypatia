import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { Button, Toggle } from '@whiteeclipse/core-ui';

type TogglePreviewProps = ComponentProps<typeof Toggle> & {
    treatment: 'fill' | 'marker';
    size?: ComponentProps<typeof Button>['size'];
};

/** Renders a selectable-action candidate with Radix pressed-state behaviour. */
function TogglePreview({ treatment, size, defaultPressed, ...props }: TogglePreviewProps) {
    const sizing = size === undefined ? {} : { size };
    return (
        <Button asChild variant="solid" {...sizing} className="primary-button toggle-button" data-treatment={treatment}>
            <Toggle key={String(defaultPressed)} defaultPressed={defaultPressed} {...props} />
        </Button>
    );
}

/** Presents one toggle treatment with initially on/off and disabled examples. */
function TogglePreviewTreatment({ treatment, children, size }: Pick<TogglePreviewProps, 'treatment' | 'children' | 'size'>) {
    const title = treatment === 'fill' ? 'Selected fill' : 'Selection marker';

    return (
        <section aria-label={title}>
            <h2>{title}</h2>
            <div className="button-states">
                <div>
                    <TogglePreview treatment={treatment} size={size}>{children}</TogglePreview>
                    <span>Starts off</span>
                </div>
                <div>
                    <TogglePreview treatment={treatment} size={size} defaultPressed>{children}</TogglePreview>
                    <span>Starts on</span>
                </div>
                <div>
                    <TogglePreview treatment={treatment} size={size} disabled>{children}</TogglePreview>
                    <span>Disabled off</span>
                </div>
                <div>
                    <TogglePreview treatment={treatment} size={size} defaultPressed disabled>{children}</TogglePreview>
                    <span>Disabled on</span>
                </div>
            </div>
        </section>
    );
}

/** Compares selected-fill and selection-marker ways of expressing toggle state. */
function TogglePreviewComparison(props: Pick<TogglePreviewProps, 'children' | 'size'>) {
    return (
        <main className="button-comparison">
            <TogglePreviewTreatment {...props} treatment="fill" />
            <TogglePreviewTreatment {...props} treatment="marker" />
        </main>
    );
}

/** Registers the toggle study and its initial-state and appearance controls. */
const meta = {
    title: 'Components/Buttons/Toggle',
    component: TogglePreview,
    args: { children: 'Pin panel', treatment: 'fill', size: '3', defaultPressed: false },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['fill', 'marker'] },
        children: { control: 'text' },
        size: { control: 'select', options: ['1', '2', '3', '4'] },
        defaultPressed: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof TogglePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive toggle specimen whose starting selection can be changed in Controls. */
export const Playground: Story = {
    decorators: [(Story) => <div className="button-playground"><Story /></div>],
};

/** Side-by-side toggle treatments with enabled and disabled selection states. */
export const Comparison: Story = {
    parameters: { controls: { include: ['children', 'size'] } },
    render: (args) => <TogglePreviewComparison {...args} />,
};
