/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement } from "react";
import { Select } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";


/**
 * Shares the reader's responsive language controls between website modules.
 *
 * @param props Available interface and document languages.
 * @param props.languages Locale identifiers supported by the current catalogue.
 * @returns Desktop language buttons and a narrow-screen language menu.
 */
export function LanguageSelector({ languages }: { languages: string[] }): ReactElement {
    const { locale, changeLocale } = useLocale();
    const { t } = useTranslation("website");
    const available = [...new Set([...languages, locale])].map(language => {
        return {
            locale: language,
            name: new Intl.DisplayNames([language], { type: "language" }).of(language) ?? language,
        };
    });
    /**
     * Changes the shared interface and document language.
     *
     * @param language The selected locale identifier.
     */
    function select(language: string): void {
        void changeLocale(language);
    }
    const options = available.map(language => (
        <Select.Item key={language.locale} value={language.locale} lang={language.locale}>
            {language.name}
        </Select.Item>
    ));
    const buttons = available.map(language => (
        <button
            key={language.locale}
            type="button"
            lang={language.locale}
            aria-label={language.name}
            aria-pressed={locale === language.locale}
            className="min-h-8 min-w-10 cursor-pointer border border-transparent bg-(--gray-4) px-2 text-xs text-(--gray-12) hover:bg-(--gray-5) focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-(--gray-11) aria-pressed:border-(--gray-7) aria-pressed:bg-(--gray-1)"
            onClick={() => {
                select(language.locale);
            }}
        >
            {language.locale.toUpperCase()}
        </button>
    ));
    return (
        <>
            <div className="shrink-0 sm:hidden">
                <Select.Root value={locale} onValueChange={select} size="1">
                    <Select.Trigger aria-label={t("language")} />
                    <Select.Content>{options}</Select.Content>
                </Select.Root>
            </div>
            <div role="group" aria-label={t("language")} className="hidden shrink-0 sm:flex">
                {buttons}
            </div>
        </>
    );
}
