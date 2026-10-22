import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { IconButton } from '@whiteeclipse/core-ui';

type IconButtonPreviewProps = Omit<ComponentProps<typeof IconButton>, 'children' | 'variant'> & {
    treatment: 'corners' | 'filled';
    label: string;
};

/** Renders an icon-only action candidate with a configurable accessible name. */
function IconButtonPreview({ treatment, label, ...props }: IconButtonPreviewProps) {
    return (
        <IconButton
            {...props}
            variant="solid"
            className={treatment === 'corners' ? 'icon-button-corners' : undefined}
            aria-label={label}
            title={label}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
                <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
        </IconButton>
    );
}

/** Presents one icon-button treatment across its available action states. */
function IconButtonPreviewTreatment({ treatment, label, size }: Pick<IconButtonPreviewProps, 'treatment' | 'label' | 'size'>) {
    const sizing = size === undefined ? {} : { size };
    const title = treatment === 'corners' ? 'Corners' : 'Filled';

    return (
        <section aria-label={title}>
            <h2>{title}</h2>
            <div className="button-states">
                <div>
                    <IconButtonPreview treatment={treatment} label={label} {...sizing} />
                    <span>Default</span>
                </div>
                <div>
                    <IconButtonPreview treatment={treatment} label={label} {...sizing} disabled />
                    <span>Disabled</span>
                </div>
                <div>
                    <IconButtonPreview treatment={treatment} label={label} {...sizing} loading />
                    <span>Loading</span>
                </div>
            </div>
        </section>
    );
}

/** Compares corner-outline and filled icon-button candidates. */
function IconButtonPreviewComparison(props: Pick<IconButtonPreviewProps, 'label' | 'size'>) {
    return (
        <main className="button-comparison">
            <IconButtonPreviewTreatment {...props} treatment="corners" />
            <IconButtonPreviewTreatment {...props} treatment="filled" />
        </main>
    );
}

/** Registers the icon-button study and its label, treatment, and state controls. */
const meta = {
    title: 'Components/Buttons/Icon',
    component: IconButtonPreview,
    args: { label: 'Next', treatment: 'corners', size: '3' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['corners', 'filled'] },
        label: { control: 'text' },
        size: { control: 'select', options: ['1', '2', '3', '4'] },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
    },
} satisfies Meta<typeof IconButtonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive icon-button specimen for exploring sizing and state. */
export const Playground: Story = {
    decorators: [(Story) => <div className="button-playground"><Story /></div>],
};

/** Side-by-side icon-button treatments with default, disabled, and loading examples. */
export const Comparison: Story = {
    parameters: { controls: { include: ['label', 'size'] } },
    render: (args) => <IconButtonPreviewComparison {...args} />,
};
