/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useEffect, useRef, useState, type ChangeEvent, type ReactElement } from "react";
import {
    Checkbox,
    Code,
    RadioGroup,
    Select,
    Separator,
    Slider,
    Switch,
    Text,
    TextArea,
    TextField,
    Tooltip,
} from "@radix-ui/themes";

import { useTranslation } from "@whiteeclipse/i18next";

/** Localized required-field feedback supplied by the form. */
export interface ReleaseFieldsProps {
    invalidName: boolean;
    invalidReview: boolean;
}

const defaultRetention = 14;
const maximumRetention = 30;

/**
 * Groups native and Radix inputs in a realistic release configuration form.
 *
 * @param props - Required-field validation state.
 * @returns Labelled fields with responsive spacing and local state.
 */
export function ReleaseFields(props: ReleaseFieldsProps): ReactElement {
    const { t } = useTranslation("core-ui");
    const [name, setName] = useState<string>();
    const [summary, setSummary] = useState<string>();
    let nameError: string | undefined;
    let reviewError: string | undefined;
    if (props.invalidName) {
        nameError = "release-name-error";
    }
    if (props.invalidReview) {
        reviewError = "release-review-error";
    }
    /**
     * Preserves an edited release name when the toolbar language changes.
     *
     * @param event - The release name input.
     */
    function changeName(event: ChangeEvent<HTMLInputElement>): void {
        setName(event.currentTarget.value);
    }
    /**
     * Preserves an edited summary when the toolbar language changes.
     *
     * @param event - The summary textarea.
     */
    function changeSummary(event: ChangeEvent<HTMLTextAreaElement>): void {
        setSummary(event.currentTarget.value);
    }
    const [retention, setRetention] = useState(defaultRetention);
    const slider = useRef<HTMLSpanElement>(null);
    /**
     * Keeps the visible retention value aligned with the slider.
     *
     * @param values - The slider's current thumb values.
     */
    function changeRetention(values: number[]): void {
        setRetention(values[0] ?? defaultRetention);
    }
    /**
     * Labels internal thumbs, including those remounted by Radix after initialization.
     *
     * @returns A cleanup function for the local DOM observer.
     */
    function observeThumb(): () => void {
        /** Applies the visible label to Radix Themes' internal slider thumb. */
        function labelRetention(): void {
            slider.current?.querySelector('[role="slider"]')?.setAttribute("aria-labelledby", "retention-label");
        }
        const observer = new MutationObserver(labelRetention);
        labelRetention();
        if (slider.current !== null) {
            observer.observe(slider.current, { childList: true, subtree: true });
        }
        /** Stops observing when this form is reset or unmounted. */
        return function cleanup(): void {
            observer.disconnect();
        };
    }
    useEffect(observeThumb, []);
    return (
        <div className="grid gap-7">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                    <Text size="2" weight="medium">
                        {t("fields.name")}
                    </Text>
                    <TextField.Root
                        name="name"
                        required
                        value={name ?? t("fields.defaultName")}
                        onChange={changeName}
                        aria-invalid={props.invalidName}
                        aria-describedby={nameError}
                        placeholder={t("fields.namePlaceholder")}
                    />
                    {props.invalidName && (
                        <Text id="release-name-error" color="red" size="1" role="alert">
                            {t("validation.releaseName")}
                        </Text>
                    )}
                </label>
                <div className="grid gap-2">
                    <Text as="label" htmlFor="release-channel" size="2" weight="medium">
                        {t("fields.channel")}
                    </Text>
                    <Select.Root name="channel" defaultValue="preview">
                        <Select.Trigger id="release-channel" />
                        <Select.Content>
                            <Select.Item value="preview">{t("fields.preview")}</Select.Item>
                            <Select.Item value="stable">{t("fields.stable")}</Select.Item>
                            <Select.Item value="canary">{t("fields.canary")}</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>
            <label className="grid gap-2">
                <Text size="2" weight="medium">
                    {t("fields.summary")}
                </Text>
                <TextArea
                    name="summary"
                    rows={3}
                    value={summary ?? t("fields.defaultSummary")}
                    onChange={changeSummary}
                />
            </label>
            <label className="grid gap-2">
                <Text size="2" weight="medium">
                    {t("fields.address")}
                </Text>
                <TextField.Root name="address" readOnly defaultValue="orbit.example/preview" />
                <Text size="1" color="gray">
                    {t("fields.addressHelp")}
                </Text>
            </label>
            <Separator size="4" />
            <fieldset className="m-0 grid gap-4 border-0 p-0">
                <legend className="mb-4">
                    <Text size="2" weight="medium">
                        {t("fields.audience")}
                    </Text>
                </legend>
                <RadioGroup.Root name="audience" defaultValue="team" aria-label={t("fields.audienceLabel")}>
                    <RadioGroup.Item value="team">{t("fields.team")}</RadioGroup.Item>
                    <RadioGroup.Item value="link">{t("fields.anyone")}</RadioGroup.Item>
                </RadioGroup.Root>
                <Text size="1" color="gray">
                    {t("fields.audienceHelp")}
                </Text>
            </fieldset>
            <Separator size="4" />
            <div className="grid gap-5">
                <div className="flex items-start justify-between gap-5">
                    <label htmlFor="release-notes">
                        <Text as="p" size="2" weight="medium">
                            {t("fields.notes")}
                        </Text>
                        <Text as="p" size="1" color="gray" mt="1">
                            {t("fields.notesHelp")}
                        </Text>
                    </label>
                    <Switch id="release-notes" name="notes" defaultChecked className="shrink-0" />
                </div>
                <div className="flex items-start justify-between gap-5">
                    <label htmlFor="release-notifications">
                        <Text as="p" size="2" weight="medium">
                            {t("fields.notify")}
                        </Text>
                        <Text as="p" size="1" color="gray" mt="1">
                            {t("fields.notifyHelp")}
                        </Text>
                    </label>
                    <Switch id="release-notifications" name="notifications" className="shrink-0" />
                </div>
                <div className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Text id="retention-label" size="2" weight="medium">
                            {t("fields.retention")}
                        </Text>
                        <Tooltip content={t("fields.sliderHint")}>
                            <Code size="2">{t("fields.days", { count: retention })}</Code>
                        </Tooltip>
                    </div>
                    <Slider
                        ref={slider}
                        name="retention"
                        aria-labelledby="retention-label"
                        min={1}
                        max={maximumRetention}
                        value={[retention]}
                        onValueChange={changeRetention}
                    />
                    <Text size="1" color="gray">
                        {t("fields.retentionRange", { min: 1, max: maximumRetention })}
                    </Text>
                </div>
            </div>
            <Separator size="4" />
            <Text as="label" size="2" className="flex items-start gap-3">
                <Checkbox
                    name="reviewed"
                    required
                    aria-invalid={props.invalidReview}
                    aria-describedby={reviewError}
                    className="mt-1 shrink-0"
                />
                <span>{t("fields.reviewed")}</span>
            </Text>
            {props.invalidReview && (
                <Text id="release-review-error" color="red" size="1" role="alert">
                    {t("validation.review")}
                </Text>
            )}
        </div>
    );
}
