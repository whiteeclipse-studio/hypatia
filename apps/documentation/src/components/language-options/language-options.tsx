/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useState, type ReactElement } from "react";
import { SegmentedControl, Text } from "@whiteeclipse/core-ui";
import { useTranslation } from "react-i18next";
import styles from "./language-options.module.css";
import type { DocumentationPage } from "../../content/types";
import { documentVariants, selectTranslation } from "../../content/localization";

/** Page variants used when a locale change has a corresponding translated document. */
interface LanguageOptionsProps {
    page: DocumentationPage;
}

/** Languages currently exposed by the documentation site's controls. */
type Locale = "en" | "fr" | "de" | "ja";

/**
 * Switches interface language and follows a translated document when one is available, with English fallback.
 *
 * @param props - Current page and translation inventory.
 * @param props.page - Article variants used to follow the selected document language.
 * @returns The interface language controls and any recoverable switching error.
 */
export function LanguageOptions({ page }: LanguageOptionsProps): ReactElement {
    const { t, i18n } = useTranslation("interface");
    const [failed, setFailed] = useState(false);

    /**
     * Applies the language selected in the segmented control.
     *
     * @param lang The activated language.
     */
    function selectLanguage(lang: string): void {
        setFailed(false);
        i18n.changeLanguage(lang)
            .then(() => {
                if (page.article !== null) {
                    const target = selectTranslation(
                        documentVariants(page.documents, page.article.canonicalPath, page.article.repository),
                        lang,
                    );
                    if (target !== undefined && target.route !== page.route) {
                        window.location.assign(target.route);
                    }
                }
            })
            .catch(() => {
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
