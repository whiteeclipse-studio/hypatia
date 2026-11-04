/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement, ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { Text, useThemeContext } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { LanguageSelector } from "../components/language-selector";
import lightLogo from "@whiteeclipse/core-ui/assets/white-eclipse-light.png";
import darkLogo from "@whiteeclipse/core-ui/assets/white-eclipse-dark.png";
import catalogue from "virtual:whiteeclipse-locales";


/**
 * Shares the site header, footer and language selection between modules.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.children The children input.
 * @param props.headerActions Module actions displayed at the far right of the header.
 * @param props.languages Available interface and content languages.
 */
export function SiteFrame({
    children,
    headerActions,
    languages: available = Object.keys(catalogue),
}: {
    children: ReactNode;
    headerActions?: ReactNode;
    languages?: string[];
}): ReactElement {
    const { locale } = useLocale();
    const { appearance } = useThemeContext();
    const { t } = useTranslation("website");
    return (
        <div
            lang={locale}
            className="core-ui-background flex h-dvh flex-col overflow-hidden text-(--gray-12) [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-(--gray-11) [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-(--gray-11)"
        >
            <a className="fixed -top-25 left-4 z-100 bg-(--gray-1) p-4 focus:top-4" href="#documentation-content">
                {t("skip")}
            </a>
            <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-(--gray-6) p-4 md:min-h-19 md:px-8">
                <RouterLink
                    to="/"
                    className="flex items-center gap-3 font-(family-name:--brand-font-family) text-base font-light tracking-wider text-inherit uppercase no-underline md:text-xl"
                >
                    <img
                        src={appearance === "dark" ? darkLogo : lightLogo}
                        alt=""
                        width="64"
                        height="64"
                        className="size-16 shrink-0"
                    />
                    <span>White Eclipse</span>
                </RouterLink>
                <span className="hidden h-5 border-l border-(--gray-7) sm:block" aria-hidden="true" />
                <Text size="2" color="gray" className="hidden sm:block">
                    {t("documentation")}
                </Text>
                <div className="ml-auto flex shrink-0 items-center gap-5">{headerActions}</div>
            </header>
            {children}
            <footer className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-t border-(--gray-6) px-4 py-3 text-xs text-(--gray-11) md:px-8 [&_a]:text-inherit">
                <span>
                    Copyright © 2026 White Eclipse · <a href="/hypatia/licence/">MIT License</a>
                </span>
                <LanguageSelector languages={available} />
            </footer>
        </div>
    );
}
