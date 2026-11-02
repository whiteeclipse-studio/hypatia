/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Text, useThemeContext } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import lightLogo from "@whiteeclipse/core-ui/assets/white-eclipse-light.png";
import darkLogo from "@whiteeclipse/core-ui/assets/white-eclipse-dark.png";

/** Local documentation home action. */
interface ReaderHeaderProps {
    onHome(): void;
}

/**
 * Pairs the studio identity with the documentation site name.
 *
 * @param props - The local project-overview navigation action.
 * @returns A compact brand header using the active Core UI theme.
 */
export function ReaderHeader(props: ReaderHeaderProps): ReactElement {
    const { appearance } = useThemeContext();
    const { t } = useTranslation("documentation");
    let logo = lightLogo;
    if (appearance === "dark") {
        logo = darkLogo;
    }
    /** Opens the project overview without leaving the story. */
    function home(): void {
        props.onHome();
    }
    return (
        <header className="flex min-h-19 shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-(--gray-6) px-4 py-4 sm:px-8">
            <button
                type="button"
                onClick={home}
                aria-label={`White Eclipse — ${t("common.home")}`}
                className="flex cursor-pointer items-center gap-3 bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--gray-11)"
            >
                <img src={logo} alt="White Eclipse" width="64" height="64" className="size-16 shrink-0" />
                <span className="font-(family-name:--brand-font-family) text-xl font-light tracking-wider uppercase">
                    White Eclipse
                </span>
            </button>
            <span className="hidden h-5 border-l border-(--gray-7) sm:block" aria-hidden="true" />
            <Text size="2" color="gray" className="hidden sm:block">
                {t("common.documentation")}
            </Text>
            <Text size="1" color="gray" className="ml-auto hidden lg:block">
                {t("common.tagline")}
            </Text>
        </header>
    );
}
