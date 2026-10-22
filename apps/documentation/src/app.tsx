/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { CoreTheme } from "@whiteeclipse/core-ui";
import { LocalizationProvider, type i18n } from "@whiteeclipse/i18next";
import { useSystemAppearance } from "./hooks/use-system-appearance";
import { DocumentationLayout } from "./layouts/documentation/documentation-layout";
import { OverviewPage } from "./pages/overview/overview-page";
import { DocumentPage } from "./pages/document/document-page";
import type { DocumentationPage } from "./content/types";

/** Translation instance scoped to the browser or one independent server render. */
interface AppProps {
    i18n: i18n;
    page: DocumentationPage;
}

/**
 * Composes the exploratory navigation shell under draft RFC-0002, RFC-0003, and Core UI.
 *
 * @param props - Application translation context.
 * @param props.i18n - Configured translation instance.
 * @param props.page - Server-rendered article and navigation snapshot.
 * @returns The exploratory application wrapped in the shared Core UI theme.
 */
export function App({ i18n, page }: AppProps): ReactElement {
    const appearance = useSystemAppearance();

    return (
        <LocalizationProvider instance={i18n} fallback={<span role="status">{i18n.t("interface:loading")}</span>}>
            <CoreTheme appearance={appearance}>
                <DocumentationLayout page={page}>
                    {page.article === null ? (
                        <OverviewPage repositories={page.repositories} />
                    ) : (
                        <DocumentPage article={page.article} documents={page.documents} />
                    )}
                </DocumentationLayout>
            </CoreTheme>
        </LocalizationProvider>
    );
}
