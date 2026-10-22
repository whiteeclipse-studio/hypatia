/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { CoreTheme } from "@whiteeclipse/core-ui";
import { useSystemAppearance } from "./hooks/use-system-appearance";
import { LandingPage } from "./pages/landing/landing-page";
import { LocalizationProvider, type i18n } from "@whiteeclipse/i18next";

/** Translation instance scoped to the current SSR request or browser application. */
interface AppProps {
    i18n: i18n;
}

/**
 * Applies the system colour preference to the shared exploratory Core UI theme.
 *
 * @param props - Application translation context.
 * @param props.i18n - Configured translation instance.
 * @returns The application theme and selected page.
 */
export function App({ i18n }: AppProps): ReactElement {
    const appearance = useSystemAppearance();

    return (
        <LocalizationProvider instance={i18n} fallback={<span role="status">{i18n.t("interface:loading")}</span>}>
            <CoreTheme appearance={appearance}>
                <LandingPage />
            </CoreTheme>
        </LocalizationProvider>
    );
}
