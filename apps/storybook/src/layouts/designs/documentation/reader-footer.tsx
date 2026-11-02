/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { getLogger } from "@whiteeclipse/log";
import type { ReactElement } from "react";
import { Link, Select } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";

const logger = getLogger(["whiteeclipse", "storybook", "documentation"]);

const languages = [
    { locale: "en", label: "EN", name: "English" },
    { locale: "fr", label: "FR", name: "Français" },
    { locale: "de", label: "DE", name: "Deutsch" },
    { locale: "ja", label: "JA", name: "日本語" },
];

/** An optional adapter for the enclosing review environment's locale controls. */
export interface ReaderFooterProps {
    onLocaleChange?: ((locale: string) => void) | undefined;
}

/**
 * Keeps site legal information and language selection visible below the reading panes.
 *
 * @param props - The optional shared-toolbar locale adapter.
 * @returns The responsive site bottom bar.
 */
export function ReaderFooter(props: ReaderFooterProps): ReactElement {
    const { locale, changeLocale } = useLocale();
    const { t } = useTranslation("documentation");
    /**
     * Synchronizes either language control with the enclosing toolbar when available.
     *
     * @param next - The selected language.
     */
    function selectLanguage(next: string): void {
        if (props.onLocaleChange) {
            props.onLocaleChange(next);
            return;
        }
        changeLocale(next).catch((error: unknown) => {
            logger.error("Failed to change reader locale.", { locale: next, error });
            reportError(error);
        });
    }
    /**
     * Renders a language action with its native accessible name.
     *
     * @param language - A supported sample language.
     * @returns Its compact selection button.
     */
    function languageButton(language: (typeof languages)[number]): ReactElement {
        /** Synchronizes the enclosing toolbar when one is available. */
        function select(): void {
            selectLanguage(language.locale);
        }
        return (
            <button
                key={language.locale}
                type="button"
                lang={language.locale}
                aria-label={language.name}
                aria-pressed={locale === language.locale}
                onClick={select}
                className="min-h-8 min-w-10 cursor-pointer border border-transparent bg-(--gray-4) px-2 text-xs text-(--gray-12) hover:bg-(--gray-5) focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-(--gray-11) aria-pressed:border-(--gray-7) aria-pressed:bg-(--gray-1)"
            >
                {language.label}
            </button>
        );
    }
    /**
     * Presents a language by its native name in the narrow-screen dropdown.
     *
     * @param language - A supported sample language.
     * @returns Its language menu option.
     */
    function languageOption(language: (typeof languages)[number]): ReactElement {
        return (
            <Select.Item key={language.locale} value={language.locale} lang={language.locale}>
                {language.name}
            </Select.Item>
        );
    }
    const buttons = languages.map(languageButton);
    const options = languages.map(languageOption);
    return (
        <footer className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-t border-(--gray-6) px-4 py-3 text-xs text-(--gray-11) sm:gap-6 sm:px-8">
            <p className="m-0 flex min-w-0 flex-1 flex-wrap gap-x-1 leading-5">
                <span>Copyright ©&nbsp;2026 White&nbsp;Eclipse</span>
                <Link href="https://whiteeclipse.dev/LICENCE" color="gray" underline="hover">
                    MIT License
                </Link>
            </p>
            <div className="shrink-0 sm:hidden">
                <Select.Root value={locale} onValueChange={selectLanguage} size="1">
                    <Select.Trigger aria-label={t("common.language")} />
                    <Select.Content>{options}</Select.Content>
                </Select.Root>
            </div>
            <div role="group" aria-label={t("common.language")} className="hidden shrink-0 sm:flex">
                {buttons}
            </div>
        </footer>
    );
}
