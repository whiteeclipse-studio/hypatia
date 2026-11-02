/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useState, type SubmitEvent, type ReactElement } from "react";
import { AlertDialog, Button, Callout, Heading, Text, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { ReleaseFields } from "./release-fields";

/**
 * Presents a local release form with localized validation, save feedback, and confirmed reset.
 *
 * @returns A complete interactive settings form.
 */
export function ReleaseForm(): ReactElement {
    const { t } = useTranslation("core-ui");
    const [invalidName, setInvalidName] = useState(false);
    const [invalidReview, setInvalidReview] = useState(false);
    const [revision, setRevision] = useState(0);
    const [saved, setSaved] = useState("");
    /**
     * Validates required fields with localized feedback before acknowledging a local save.
     *
     * @param event - The submitted form.
     */
    function save(event: SubmitEvent<HTMLFormElement>): void {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const value = data.get("name");
        let name = "";
        if (typeof value === "string") {
            name = value.trim();
        }
        const missingName = name === "";
        const missingReview = !data.has("reviewed");
        setInvalidName(missingName);
        setInvalidReview(missingReview);
        if (missingName || missingReview) {
            setSaved("");
            let selector = '[role="checkbox"]';
            if (missingName) {
                selector = 'input[name="name"]';
            }
            event.currentTarget.querySelector<HTMLElement>(selector)?.focus();
            return;
        }
        setSaved(name);
    }
    /** Remounts the form fields to restore every default, including Radix control state. */
    function reset(): void {
        setRevision(revision + 1);
        setSaved("");
        setInvalidName(false);
        setInvalidReview(false);
    }
    /** Removes stale success feedback when a field changes. */
    function edited(): void {
        setSaved("");
        setInvalidName(false);
        setInvalidReview(false);
    }
    return (
        <section
            aria-labelledby="release-details"
            className="min-w-0 border border-(--gray-6) bg-(--gray-1) p-5 sm:p-8"
        >
            <Heading as="h2" id="release-details" size="5" mb="2">
                {t("form.title")}
            </Heading>
            <Text as="p" size="2" color="gray" mb="6">
                {t("form.description")}
            </Text>
            <form key={revision} noValidate onSubmit={save} onChange={edited} className="grid gap-7">
                <ReleaseFields invalidName={invalidName} invalidReview={invalidReview} />
                <div role="status" aria-live="polite">
                    {saved !== "" && (
                        <Callout.Root color="green">
                            <Callout.Text>{t("form.saved", { name: saved })}</Callout.Text>
                        </Callout.Root>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-(--gray-6) pt-6">
                    <Button type="submit">{t("form.save")}</Button>
                    <Tooltip content={t("form.publishUnavailable")}>
                        <span>
                            <Button type="button" variant="soft" disabled>
                                {t("form.publish")}
                            </Button>
                        </span>
                    </Tooltip>
                    <AlertDialog.Root>
                        <AlertDialog.Trigger>
                            <Button type="button" variant="ghost" className="sm:ml-auto">
                                {t("form.reset")}
                            </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content maxWidth="440px">
                            <AlertDialog.Title>{t("form.resetTitle")}</AlertDialog.Title>
                            <AlertDialog.Description>{t("form.resetDescription")}</AlertDialog.Description>
                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <AlertDialog.Cancel>
                                    <Button variant="outline">{t("form.keep")}</Button>
                                </AlertDialog.Cancel>
                                <AlertDialog.Action>
                                    <Button color="red" onClick={reset}>
                                        {t("form.confirmReset")}
                                    </Button>
                                </AlertDialog.Action>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Root>
                </div>
            </form>
        </section>
    );
}
