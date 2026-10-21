import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { Button } from '@whiteeclipse/core-ui';

type PrimaryButtonProps = Omit<ComponentProps<typeof Button>, 'variant'> & {
    treatment: 'plain' | 'marker';
};

/** Renders a primary-action design candidate for exploration in Storybook. */
function PrimaryButton({ treatment, ...props }: PrimaryButtonProps) {
    return <Button {...props} variant="solid" className="primary-button" data-treatment={treatment} />;
}

/** Presents one treatment across default, disabled, and loading states. */
function PrimaryButtonTreatment({ treatment, children, size }: Pick<PrimaryButtonProps, 'treatment' | 'children' | 'size'>) {
    const title = treatment === 'plain' ? 'Plain' : 'With marker';

    return (
        <section aria-label={title}>
            <h2>{title}</h2>
            <div className="button-states">
                <div>
                    <PrimaryButton treatment={treatment} size={size}>{children}</PrimaryButton>
                    <span>Default</span>
                </div>
                <div>
                    <PrimaryButton treatment={treatment} size={size} disabled>{children}</PrimaryButton>
                    <span>Disabled</span>
                </div>
                <div>
                    <PrimaryButton treatment={treatment} size={size} loading>{children}</PrimaryButton>
                    <span>Loading</span>
                </div>
            </div>
        </section>
    );
}

/** Compares the plain and marker treatments with matching labels and sizes. */
function PrimaryButtonComparison(props: Pick<PrimaryButtonProps, 'children' | 'size'>) {
    return (
        <main className="button-comparison">
            <PrimaryButtonTreatment {...props} treatment="plain" />
            <PrimaryButtonTreatment {...props} treatment="marker" />
        </main>
    );
}

/** Registers the primary-button study and its editable Storybook controls. */
const meta = {
    title: 'Components/Buttons/Primary',
    component: PrimaryButton,
    args: { children: 'Continue', treatment: 'plain', size: '3' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['plain', 'marker'] },
        children: { control: 'text' },
        size: { control: 'select', options: ['1', '2', '3', '4'] },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
    },
} satisfies Meta<typeof PrimaryButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive primary-button specimen with editable treatment and state. */
export const Playground: Story = {
    decorators: [(Story) => <div className="button-playground"><Story /></div>],
};

/** Side-by-side primary-button treatments with representative states. */
export const Comparison: Story = {
    parameters: { controls: { include: ['children', 'size'] } },
    render: (args) => <PrimaryButtonComparison {...args} />,
};
