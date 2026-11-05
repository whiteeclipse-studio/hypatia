/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement, ReactNode } from "react";
import { Text, useThemeContext } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { LanguageSelector } from "../components/language-selector";
import lightLogo from "@whiteeclipse/core-ui/assets/white-eclipse-light.png";
import darkLogo from "@whiteeclipse/core-ui/assets/white-eclipse-dark.png";
import catalogue from "virtual:whiteeclipse-locales";
import styles from "./site-frame.module.css";


/**
 * Shares the site header, footer and language selection between modules.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.children The children input.
 * @param props.headerActions Module actions displayed at the far right of the header.
 * @param props.languages Available interface and content languages.
 * @param props.landingOrigin The landing page destination for the studio brand.
 */
export function SiteFrame({
    children,
    headerActions,
    landingOrigin,
    languages: available = Object.keys(catalogue),
}: {
    children: ReactNode;
    headerActions?: ReactNode;
    languages?: string[];
    landingOrigin: string;
}): ReactElement {
    const { locale } = useLocale();
    const { appearance } = useThemeContext();
    const { t } = useTranslation("website");
    return (
        <div
            lang={locale}
            className="core-ui-background flex h-dvh min-h-0 flex-col overflow-hidden text-(--gray-12) before:absolute after:absolute [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-(--gray-11) [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-(--gray-11)"
        >
            <a className="fixed -top-25 left-4 z-100 bg-(--gray-1) p-4 focus:top-4" href="#documentation-content">
                {t("skip")}
            </a>
            <header
                className={`${styles["header"]} flex min-h-0 shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-(--gray-6) bg-(--gray-1) py-0 pt-[calc(env(safe-area-inset-top,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] lg:min-h-19 lg:pt-[calc(env(safe-area-inset-top,0px))] lg:pr-[calc(1rem+env(safe-area-inset-right,0px))] lg:pl-[calc(1rem+env(safe-area-inset-left,0px))]`}
            >
                <a
                    href={landingOrigin}
                    className="flex items-center gap-3 font-(family-name:--brand-font-family) text-base font-light tracking-wider text-inherit uppercase no-underline lg:text-xl"
                >
                    <img
                        src={appearance === "dark" ? darkLogo : lightLogo}
                        alt=""
                        width="64"
                        height="64"
                        className="size-12 shrink-0 lg:size-16"
                    />
                    <span>White Eclipse</span>
                </a>
                <span className="hidden h-5 border-l border-(--gray-7) sm:block" aria-hidden="true" />
                <Text size="2" color="gray" className="hidden sm:block">
                    {t("documentation")}
                </Text>
                <div className="ml-auto flex shrink-0 items-center gap-5">{headerActions}</div>
            </header>
            {children}
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-(--gray-6) bg-(--gray-1) py-2 pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] text-xs text-(--gray-11) lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] [&_a]:text-inherit">
                <span>
                    Copyright © 2026 White Eclipse · <a href="/hypatia/licence/">MIT License</a>
                </span>
                <LanguageSelector languages={available} />
            </footer>
        </div>
    );
}
