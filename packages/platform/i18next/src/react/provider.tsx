/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Suspense, use, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import type { i18n } from "i18next";
import type { TranslationCatalogue } from "../catalogue/index.ts";
import { readBrowserPreferences, selectLocale } from "../preferences/index.ts";
import { LocaleContext } from "./locale-context.ts";

/** Rendering inputs; initialization and request selection remain outside React. */
export interface I18nProviderProps {
    readonly children: ReactNode;
    readonly session: i18n | Promise<i18n>;
    readonly catalogue: TranslationCatalogue;
    readonly fallback?: ReactNode;
    /** Supply the generated HTML's locale on both server and client during hydration. */
    readonly initialLocale?: string;
    /** Defaults to true; disable for a view that must retain its explicit locale. */
    readonly applyBrowserPreferences?: boolean;
}

/**
 * Provides a session with a loading boundary for initialization and translation resources.
 *
 * @param props - The stable session or initialization promise and rendering configuration.
 * @returns A localized subtree inside Suspense.
 */
export function I18nProvider(props: I18nProviderProps): ReactElement {
    return (
        <Suspense fallback={props.fallback ?? null}>
            <ReadyProvider {...props} />
        </Suspense>
    );
}

/**
 * Applies browser preferences after mounting while retaining each consumer's hydration locale.
 *
 * @param props - Provider inputs, including a promise created outside rendering when pending.
 * @returns The initialized session's React contexts.
 * @throws {Error} For an uninitialized instance or a failed browser language change.
 */
function ReadyProvider(props: I18nProviderProps): ReactElement {
    const { catalogue, initialLocale, applyBrowserPreferences = true } = props;
    const session = "then" in props.session ? use(props.session) : props.session;
    if (!session.isInitialized) {
        throw new Error("Pass an initialized session or its createSession promise to I18nProvider.");
    }

    const context = useMemo(() => {
        return { session, initialLocale: initialLocale ?? session.language };
    }, [session, initialLocale]);
    const [error, setError] = useState<unknown>();
    useEffect(() => {
        if (applyBrowserPreferences && typeof window !== "undefined") {
            const locale = selectLocale(readBrowserPreferences(), catalogue);
            if (locale !== session.language) {
                session.changeLanguage(locale).catch(setError);
            }
        }
    }, [session, catalogue, applyBrowserPreferences]);
    if (error !== undefined) {
        throw new Error("Failed to apply browser locale.", { cause: error });
    }

    return (
        <LocaleContext.Provider value={context}>
            <I18nextProvider i18n={session}>{props.children}</I18nextProvider>
        </LocaleContext.Provider>
    );
}
