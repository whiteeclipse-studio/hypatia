/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { getLogger } from "@whiteeclipse/log";
import { useEffect } from "react";
import type { Decorator } from "@storybook/react-vite";
import { createSession, I18nProvider } from "@whiteeclipse/i18next";
import catalogue from "virtual:whiteeclipse-locales";
import { resolveLocale, type Locale } from "../src/internationalization/locales";

const logger = getLogger(["whiteeclipse", "storybook", "locale"]);

const sessions = new Map<Locale, ReturnType<typeof createSession>>();

/**
 * Applies the locale toolbar to stories without overriding it with browser preferences.
 *
 * @param Story - The story being rendered.
 * @param context - The current Storybook globals.
 * @returns The localized story with an appropriate document language.
 */
export const withLocale: Decorator = function WithLocale(Story, context) {
    const locale = resolveLocale(context.globals["locale"]);
    let session = sessions.get(locale);
    if (session === undefined) {
        session = createSession(catalogue, locale).catch((error: unknown) => {
            logger.error("Failed to initialize story locale.", { locale, error });
            throw error;
        });
        sessions.set(locale, session);
    }
    /** Updates the preview document's language for assistive technology. */
    function updateDocumentLanguage(): void {
        document.documentElement.lang = locale;
        logger.debug("Applied story locale {locale}.", { locale });
    }
    useEffect(updateDocumentLanguage, [locale]);

    return (
        <I18nProvider session={session} catalogue={catalogue} applyBrowserPreferences={false}>
            <Story />
        </I18nProvider>
    );
};
