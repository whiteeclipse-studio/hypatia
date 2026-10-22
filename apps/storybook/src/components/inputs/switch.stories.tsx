import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { Switch } from '@whiteeclipse/core-ui';

type SwitchPreviewProps = ComponentProps<typeof Switch> & {
    treatment: 'filled' | 'corners';
    label: string;
};

/** Renders a labelled on/off setting candidate with local preview state. */
function SwitchPreview({ treatment, label, defaultChecked, disabled, ...props }: SwitchPreviewProps) {
    return (
        <label className="switch-label" data-disabled={disabled || undefined}>
            <Switch
                key={String(defaultChecked)}
                {...props}
                defaultChecked={defaultChecked}
                disabled={disabled}
                className="switch-preview"
                data-treatment={treatment}
            />
            {label}
        </label>
    );
}

/** Presents one switch treatment with enabled and disabled on/off examples. */
function SwitchTreatment({ treatment, label, size }: Pick<SwitchPreviewProps, 'treatment' | 'label' | 'size'>) {
    const sizing = size === undefined ? {} : { size };
    const title = treatment === 'filled' ? 'Filled track' : 'Corner frame';

    return (
        <section aria-label={title}>
            <h2>{title}</h2>
            <div className="button-states">
                <div>
                    <SwitchPreview treatment={treatment} label={label} {...sizing} />
                    <span>Starts off</span>
                </div>
                <div>
                    <SwitchPreview treatment={treatment} label={label} {...sizing} defaultChecked />
                    <span>Starts on</span>
                </div>
                <div>
                    <SwitchPreview treatment={treatment} label={label} {...sizing} disabled />
                    <span>Disabled off</span>
                </div>
                <div>
                    <SwitchPreview treatment={treatment} label={label} {...sizing} defaultChecked disabled />
                    <span>Disabled on</span>
                </div>
            </div>
        </section>
    );
}

/** Compares filled-track and corner-frame presentations of the same setting. */
function SwitchComparison(props: Pick<SwitchPreviewProps, 'label' | 'size'>) {
    return (
        <main className="button-comparison">
            <SwitchTreatment {...props} treatment="filled" />
            <SwitchTreatment {...props} treatment="corners" />
        </main>
    );
}

/** Registers the switch study and its label, initial-state, and appearance controls. */
const meta = {
    title: 'Components/Inputs/Switch',
    component: SwitchPreview,
    args: { label: 'Show reading progress', treatment: 'filled', size: '3', defaultChecked: false },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['filled', 'corners'] },
        label: { control: 'text' },
        size: { control: 'select', options: ['1', '2', '3'] },
        defaultChecked: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof SwitchPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive setting specimen for exploring size, treatment, and initial state. */
export const Playground: Story = {
    decorators: [(Story) => <div className="button-playground"><Story /></div>],
};

/** Side-by-side switch treatments covering enabled and disabled on/off states. */
export const Comparison: Story = {
    parameters: { controls: { include: ['label', 'size'] } },
    render: (args) => <SwitchComparison {...args} />,
};
