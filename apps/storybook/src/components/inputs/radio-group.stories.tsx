import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import type { ComponentProps } from 'react';
import { RadioGroup } from '@whiteeclipse/core-ui';

type RadioGroupPreviewProps = Omit<ComponentProps<typeof RadioGroup.Root>, 'children'> & {
    treatment: 'circle' | 'corners';
    label: string;
};

type RadioOptionProps = {
    value: string;
    label: string;
    treatment: RadioGroupPreviewProps['treatment'];
    disabled?: boolean | undefined;
};

/** Renders a labelled radio option within the active single-selection group. */
function RadioOption({ value, label, treatment, disabled }: RadioOptionProps) {
    return (
        <label className="radio-label" data-disabled={disabled || undefined}>
            <RadioGroup.Item value={value} disabled={disabled} className="radio-preview" data-treatment={treatment} />
            <span>{label}</span>
        </label>
    );
}

/** Presents a named density preference with independent, local group selection. */
function RadioGroupPreview({ treatment, label, defaultValue, disabled, ...props }: RadioGroupPreviewProps) {
    const labelId = useId();

    return (
        <fieldset className="radio-fieldset">
            <legend id={labelId}>{label}</legend>
            <RadioGroup.Root key={defaultValue} {...props} defaultValue={defaultValue} disabled={disabled} aria-labelledby={labelId} orientation="vertical">
                <RadioOption value="compact" label="Compact" treatment={treatment} disabled={disabled} />
                <RadioOption value="comfortable" label="Comfortable" treatment={treatment} disabled={disabled} />
                <RadioOption value="automatic" label="Automatic (unavailable)" treatment={treatment} disabled />
                <RadioOption value="spacious" label="Spacious" treatment={treatment} disabled={disabled} />
            </RadioGroup.Root>
        </fieldset>
    );
}

/** Shows one treatment with an interactive group and a fully disabled group. */
function RadioGroupTreatment(props: Pick<RadioGroupPreviewProps, 'label' | 'size' | 'defaultValue' | 'treatment'>) {
    const title = props.treatment === 'circle' ? 'Circle' : 'Corner frame';

    return (
        <section aria-label={title}>
            <h2>{title}</h2>
            <div className="radio-comparison">
                <RadioGroupPreview {...props} />
                <RadioGroupPreview {...props} label={`${props.label} (disabled)`} disabled />
            </div>
        </section>
    );
}

/** Compares circular and corner-frame ways to present mutually exclusive choices. */
function RadioGroupComparison(props: Pick<RadioGroupPreviewProps, 'label' | 'size' | 'defaultValue'>) {
    return (
        <main className="button-comparison">
            <RadioGroupTreatment {...props} treatment="circle" />
            <RadioGroupTreatment {...props} treatment="corners" />
        </main>
    );
}

/** Registers the radio-group study and its label, initial-selection, and appearance controls. */
const meta = {
    title: 'Components/Inputs/Radio group',
    component: RadioGroupPreview,
    args: { label: 'Reading density', treatment: 'circle', size: '3', defaultValue: 'comfortable' },
    argTypes: {
        treatment: { control: 'inline-radio', options: ['circle', 'corners'] },
        label: { control: 'text' },
        size: { control: 'select', options: ['1', '2', '3'] },
        defaultValue: { control: 'select', options: ['', 'compact', 'comfortable', 'spacious'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof RadioGroupPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive group for exploring initial selection, appearance, and disabled behaviour. */
export const Playground: Story = {
    decorators: [(Story) => <div className="button-playground"><Story /></div>],
};

/** Side-by-side treatments with selected, unselected, and disabled radio options. */
export const Comparison: Story = {
    parameters: { controls: { include: ['label', 'size', 'defaultValue'] } },
    render: (args) => <RadioGroupComparison {...args} />,
};
