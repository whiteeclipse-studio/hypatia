/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { i18n } from "i18next";
import { rememberLocale } from "../preferences/index.ts";

/** The stable command target and the locale used to generate this subtree's HTML. */
export interface LocaleContextValue {
    readonly session: i18n;
    readonly initialLocale: string;
}

/** A successful explicit language choice is persisted for subsequent loads. */
type ChangeLocale = (locale: string) => Promise<void>;

export const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Reads this consumer's render locale and exposes actions on the original session.
 *
 * @returns The render locale, stable session, and an explicit, persisted language action.
 * @throws {Error} When called outside I18nProvider.
 */
export function useLocale(): { locale: string; session: i18n; changeLocale: ChangeLocale } {
    const context = useContext(LocaleContext);
    if (context === null) {
        throw new Error("Localization hooks require an I18nProvider.");
    }

    const { session, initialLocale } = context;
    const store = useMemo(() => {
        /**
         * Subscribes to language changes on this session.
         *
         * @param notify - React's change listener.
         * @returns A listener cleanup function.
         */
        const subscribe = (notify: () => void) => {
            session.on("languageChanged", notify);
            return () => {
                session.off("languageChanged", notify);
            };
        };
        /**
         * Reads the current language.
         *
         * @returns The live session locale.
         */
        const snapshot = () => session.language;
        /**
         * Preserves the initial render language.
         *
         * @returns The locale used to generate the HTML.
         */
        const serverSnapshot = () => initialLocale;
        /**
         * Applies and remembers an explicit choice.
         *
         * @param locale - The desired locale.
         * @returns Completion of the language change.
         */
        const changeLocale = async (locale: string): Promise<void> => {
            await session.changeLanguage(locale);
            rememberLocale(session.language);
        };
        return { subscribe, snapshot, serverSnapshot, changeLocale };
    }, [session, initialLocale]);
    const locale = useSyncExternalStore(store.subscribe, store.snapshot, store.serverSnapshot);

    return { locale, session, changeLocale: store.changeLocale };
}
