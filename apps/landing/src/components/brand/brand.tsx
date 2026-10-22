/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";
import { WhiteEclipseBrand } from "@whiteeclipse/core-ui";

/** Options for the repeated wordmark and optional footer description. */
interface BrandProps {
    footer?: boolean;
    className?: string | undefined;
}

/**
 * Supplies the landing page's localized description to the shared studio identity.
 *
 * @param props - Footer treatment and optional layout class.
 * @param props.footer - Whether to show the studio description.
 * @param props.className - Placement class supplied by the enclosing layout.
 * @returns The theme-aware studio brand.
 */
export function Brand({ footer = false, className = "" }: BrandProps): ReactElement {
    const { t } = useTranslation("landing");
    return <WhiteEclipseBrand className={className} description={footer ? t("brand.tagline") : undefined} />;
}
