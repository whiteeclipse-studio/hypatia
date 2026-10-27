/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Suspense, use, useId, useState, type ReactElement } from "react";
import { Box, Code, Flex, Heading, Text, Select } from "@radix-ui/themes";
import { initializeBrowser, I18nProvider, useLocale, useTranslation } from "@whiteeclipse/i18next";
import resources from "virtual:whiteeclipse-locales";

const localization = initializeBrowser(resources);
const languageNames: Record<string, string> = {
    en: "English",
    fr: "Français",
    "fr-CA": "Français (Canada)",
    de: "Deutsch",
    ja: "日本語",
};

/**
 * Includes browser-selected regional locales alongside the study's explicit language choices.
 *
 * @param current - Active locale, possibly a regional variant without its own translation file.
 * @returns Native language options, plus the current locale if needed.
 */
function languageOptions(current: string): ReactElement[] {
    const languages = { ...languageNames, [current]: languageNames[current] ?? current };
    return Object.entries(languages).map(([locale, name]) => (
        <Select.Item key={locale} value={locale}>
            {name}
        </Select.Item>
    ));
}

/**
 * Presents an exploratory language switcher backed by the application's bundled locale files.
 *
 * @returns The translated study or its loading placeholder.
 */
export function LocaleStudy(): ReactElement {
    return (
        <Suspense fallback={<Text>Loading translations…</Text>}>
            <LocalizedStudy />
        </Suspense>
    );
}

/**
 * Waits for browser preference initialization before providing the study's session.
 *
 * @returns The localized study.
 */
function LocalizedStudy(): ReactElement {
    const instance = use(localization);
    return (
        <I18nProvider session={instance} catalogue={resources}>
            <TranslationControls />
        </I18nProvider>
    );
}

/**
 * Exercises runtime selection, regional fallback, English fallback, and missing keys.
 *
 * @returns Language controls and translated output.
 */
function TranslationControls(): ReactElement {
    const { changeLocale } = useLocale();
    const { t, i18n } = useTranslation("demo.interface");
    const languageId = useId();
    const options = languageOptions(i18n.language);
    const [error, setError] = useState<string>();

    /**
     * Displays a failed language change in the study.
     *
     * @param failure - The error reported by the locale action.
     */
    function reportFailure(failure: unknown): void {
        setError(failure instanceof Error ? failure.message : String(failure));
    }

    /**
     * Applies and remembers the selected language.
     *
     * @param language - The locale selected in the language control.
     */
    function changeLanguage(language: string): void {
        setError(undefined);
        changeLocale(language).catch(reportFailure);
    }

    return (
        <Box p="5" lang={i18n.language} dir={i18n.dir()}>
            <Flex direction="column" gap="4" maxWidth="640px">
                <Heading>{t("title")}</Heading>
                <Text>{t("description")}</Text>
                <label htmlFor={languageId}>{t("language")}</label>
                <Select.Root value={i18n.language} onValueChange={changeLanguage}>
                    <Select.Trigger id={languageId} />
                    <Select.Content>{options}</Select.Content>
                </Select.Root>
                <Text>
                    {t("activeLocale")}: <Code>{i18n.language}</Code>
                </Text>
                <Box aria-live="polite">
                    <Text as="p">{t("regionalMessage")}</Text>
                    <Text as="p">{t("englishOnly")}</Text>
                    <Text as="p">
                        {t("missingLabel")}: <Code>{t("demo.interface:missing")}</Code>
                    </Text>
                </Box>
                {error !== undefined && (
                    <Text color="red" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        </Box>
    );
}
