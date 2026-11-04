/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { type ReactElement, useEffect, useMemo, useSyncExternalStore } from "react";
import { I18nProvider, type I18nProviderProps } from "@whiteeclipse/i18next";
import { Theme } from "@whiteeclipse/core-ui/theme";
import { SiteFrame } from "../shared/layouts/site-frame";
import { withContentLocales } from "../shared/i18n/session";
import { DocumentationContext } from "../modules/documentation/store/use-documentation";
import type { DocumentationStore } from "../modules/documentation/store/store";
import { DocumentationRoutes } from "../modules/documentation/routes/documentation";
import { UpdateDocumentation } from "../modules/documentation/components/update-documentation";
import { Landing } from "../modules/landing/landing";
import type { Bootstrap } from "../modules/documentation/domain/types";


/**
 * Composes shared providers and the selected website module.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.bootstrap The bootstrap input.
 * @param props.store The store input.
 * @param props.session The session input.
 */
export function App({
    bootstrap,
    store,
    session,
}: {
    bootstrap: Bootstrap;
    store: DocumentationStore;
    session: I18nProviderProps["session"];
}): ReactElement {
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    const locales = useMemo(
        () => [...new Set(state.indexes.flatMap(index => index.entries.map(entry => entry.locale)))],
        [state.indexes],
    );
    const catalogue = useMemo(() => withContentLocales(locales), [locales]);
    useEffect(() => {
        store.start();
        return () => {
            store.stop();
        };
    }, [store]);
    return (
        <I18nProvider session={session} catalogue={catalogue} initialLocale={bootstrap.locale}>
            <Theme>
                <DocumentationContext value={store}>
                    {bootstrap.module === "landing" ? (
                        <Landing />
                    ) : (
                        <SiteFrame languages={Object.keys(catalogue)} headerActions={<UpdateDocumentation />}>
                            <DocumentationRoutes />
                        </SiteFrame>
                    )}
                </DocumentationContext>
            </Theme>
        </I18nProvider>
    );
}
