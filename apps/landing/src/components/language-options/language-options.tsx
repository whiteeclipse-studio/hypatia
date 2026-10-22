/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useState, type ReactElement } from "react";
import { SegmentedControl, Text } from "@whiteeclipse/core-ui";
import { useTranslation } from "react-i18next";
import styles from "./language-options.module.css";

/** Languages currently exposed by the landing page's controls. */
type Locale = "en" | "fr" | "de" | "ja";

/**
 * Switches the interface language at runtime without navigating to another page.
 *
 * @returns The interface language controls and any recoverable switching error.
 */
export function LanguageOptions(): ReactElement {
    const { t, i18n } = useTranslation("interface");
    const [failed, setFailed] = useState(false);

    /**
     * Applies the language selected in the segmented control.
     *
     * @param lang The activated language.
     */
    function selectLanguage(lang: string): void {
        setFailed(false);
        i18n.changeLanguage(lang).catch(() => {
            setFailed(true);
        });
    }

    return (
        <div className={styles["language"]}>
            <SegmentedControl.Root
                size="1"
                value={i18n.resolvedLanguage ?? i18n.language}
                onValueChange={selectLanguage}
                aria-label={t("language.label")}
            >
                <LanguageOptionsButton lang="en" />
                <LanguageOptionsButton lang="fr" />
            </SegmentedControl.Root>
            {failed && (
                <Text size="1" role="status">
                    {t("language.changeFailed")}
                </Text>
            )}
        </div>
    );
}

/** Props passed to the {@link LanguageOptionsButton} component. */
interface LanguageOptionsButtonProps {
    /** The language displayed by the button. */
    lang: Locale;
}

/**
 * Renders a language segment using the current translation context.
 *
 * @param props - Language segment configuration.
 * @param props.lang - Language code displayed by the segment.
 * @returns The accessible language segment.
 */
function LanguageOptionsButton({ lang }: LanguageOptionsButtonProps): ReactElement {
    const { t } = useTranslation("interface");
    return (
        <SegmentedControl.Item value={lang} lang={lang} aria-label={t(`language.${lang}`)}>
            {lang.toUpperCase()}
        </SegmentedControl.Item>
    );
}
