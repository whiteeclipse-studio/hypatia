/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Suspense, use, useEffect, useState, type PropsWithChildren, type ReactElement, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import type { i18n } from "i18next";
import { i18next, ready } from "./instance";
import { selectInitialLanguage } from "./language";

/** Provider options for one application or SSR request. */
interface LocalizationProviderProps extends PropsWithChildren {
    instance?: i18n;
    fallback?: ReactNode;
}

/** Initialized translation context used below the Suspense boundary. */
interface InitializedProviderProps extends PropsWithChildren {
    instance: i18n;
}

/**
 * Waits for package initialization and restores browser preferences after hydration.
 *
 * @param props - The selected instance and translated interface.
 * @param props.instance - Configured instance, isolated per request during SSR.
 * @param props.children - Application interface.
 * @returns The react-i18next context after initialization.
 * @throws {Error} If initialization or initial language selection fails.
 */
function InitializedProvider({ instance, children }: InitializedProviderProps): ReactElement {
    use(ready);
    const [failure, setFailure] = useState<Error | undefined>();
    useEffect(() => {
        /**
         * Preserves the active locale and updates document language after a runtime change.
         *
         * @param language - Language selected through i18next.
         */
        function remember(language: string): void {
            document.documentElement.lang = instance.resolvedLanguage ?? language;
        }
        instance.on("languageChanged", remember);
        instance.changeLanguage(selectInitialLanguage(instance)).catch((cause: unknown) => {
            setFailure(new Error("Interface language initialization failed.", { cause }));
        });
        return () => {
            instance.off("languageChanged", remember);
        };
    }, [instance]);
    if (failure !== undefined) {
        throw failure;
    }
    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

/**
 * Provides the configured instance with a Suspense fallback for initialization and pending namespaces.
 * The rendered locale is preserved through SSR hydration before browser selection runs.
 *
 * @param props - Instance, application interface, and optional loading UI.
 * @param props.instance - Configured instance; defaults to the package's browser instance.
 * @param props.fallback - JSX displayed while initialization or translations are pending.
 * @param props.children - Application interface.
 * @returns The initialization and translation loading boundary.
 */
export function LocalizationProvider({
    instance = i18next,
    fallback = null,
    children,
}: LocalizationProviderProps): ReactElement {
    return (
        <Suspense fallback={fallback}>
            <InitializedProvider instance={instance}>{children}</InitializedProvider>
        </Suspense>
    );
}
