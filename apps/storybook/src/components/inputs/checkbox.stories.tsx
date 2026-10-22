import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { Checkbox } from '@whiteeclipse/core-ui';

type CheckboxPreviewProps = ComponentProps<typeof Checkbox> & {
    treatment: 'square' | 'corners';
    label: string;
};

/** Renders a labelled checkbox candidate for independent selection. */
function CheckboxPreview({ treatment, label, defaultChecked, disabled, ...props }: CheckboxPreviewProps) {
    return (
        <label className="checkbox-label" data-disabled={disabled || undefined}>
            <Checkbox
                key={String(defaultChecked)}
                {...props}
                defaultChecked={defaultChecked}
                disabled={disabled}
                className="checkbox-preview"
                data-treatment={treatment}
            />
            {label}
        </label>
    );
}

const checkboxStates = [
    { defaultChecked: false, disabled: false, caption: 'Starts unchecked' },
    { defaultChecked: true, disabled: false, caption: 'Starts checked' },
    { defaultChecked: 'indeterminate', disabled: false, caption: 'Starts mixed' },
    { defaultChecked: false, disabled: true, caption: 'Disabled unchecked' },
    { defaultChecked: true, disabled: true, caption: 'Disabled checked' },
    { defaultChecked: 'indeterminate', disabled: true, caption: 'Disabled mixed' },
] as const;

type CheckboxSampleProps = CheckboxPreviewProps & { caption: string };

/** Pairs an interactive checkbox with a caption describing its initial state. */
function CheckboxSample({ caption, ...props }: CheckboxSampleProps) {
    return (
        <div>
            <CheckboxPreview {...props} />
            <span>{caption}</span>
        </div>
    );
}

/** Presents one treatment across unchecked, checked, mixed, and disabled states. */
function CheckboxTreatment({ treatment, label, size }: Pick<CheckboxPreviewProps, 'treatment' | 'label' | 'size'>) {
    const sizing = size === undefined ? {} : { size };
    const title = treatment === 'square' ? 'Square' : 'Corner frame';
    const samples = checkboxStates.map((state) => (
        <CheckboxSample key={state.caption} {...state} treatment={treatment} label={label} {...sizing} />
    ));

    return (
        <section aria-label={title}>
            <h2>{title}</h2>
            <div className="checkbox-states">{samples}</div>
        </section>
    );
}

/** Compares square and corner-frame checkbox candidates. */
function CheckboxComparison(props: Pick<CheckboxPreviewProps, 'label' | 'size'>) {
    return (
        <main className="button-comparison">
            <CheckboxTreatment {...props} treatment="square" />
            <CheckboxTreatment {...props} treatment="corners" />
        </main>
    );
}

/** Registers the checkbox study and its label, initial-state, and treatment controls. */
const meta = {
    title: 'Components/Inputs/Checkbox',
    component: CheckboxPreview,
    args: { label: 'Show reading progress', treatment: 'square', size: '3', defaultChecked: false },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['square', 'corners'] },
        label: { control: 'text' },
        size: { control: 'select', options: ['1', '2', '3'] },
        defaultChecked: { control: 'select', options: [false, true, 'indeterminate'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof CheckboxPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive checkbox specimen for exploring selection and disabled states. */
export const Playground: Story = {
    decorators: [(Story) => <div className="button-playground"><Story /></div>],
};

/** Side-by-side checkbox treatments covering the complete starter state matrix. */
export const Comparison: Story = {
    parameters: { controls: { include: ['label', 'size'] } },
    render: (args) => <CheckboxComparison {...args} />,
};
