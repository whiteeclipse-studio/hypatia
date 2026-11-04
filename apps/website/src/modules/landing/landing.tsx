/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { type ReactElement, useEffect } from "react";
import { Separator } from "@radix-ui/themes";
import { SiteLayout } from "./layouts/site/site-layout";
import { Hero } from "./layouts/landing/hero";
import { Studio } from "./layouts/landing/studio";
import { NextSteps } from "./layouts/landing/next-steps";
import { Documentation } from "./layouts/landing/documentation";
import { Services } from "./layouts/landing/services";
import { ServiceCard } from "./components/service-card/service-card";
import { CodeIcon, CopyIcon, GearIcon, GridIcon } from "@radix-ui/react-icons";


/**
 * Selects the landing page's section order and supplies its illustrative service content.
 *
 * @returns The exploratory landing page within the shared site layout.
 */
export function Landing({ documentationOrigin }: { documentationOrigin: string }): ReactElement {
    const { locale } = useLocale();
    const { t } = useTranslation("landing");
    useEffect(() => {
        document.documentElement.lang = locale;
        document.title = t("metadata.title");
        document
            .querySelector<HTMLMetaElement>('meta[name="description"]')
            ?.setAttribute("content", t("metadata.description"));
    }, [t, locale]);
    return (
        <SiteLayout>
            <Hero />
            <Separator size="4" />
            <Studio>
                <Services>
                    <ServiceCard
                        title={t("services.consulting.title")}
                        icon={CopyIcon}
                        description={t("services.consulting.description")}
                    />
                    <ServiceCard
                        title={t("services.modernisation.title")}
                        icon={CodeIcon}
                        description={t("services.modernisation.description")}
                    />
                    <ServiceCard
                        title={t("services.automation.title")}
                        icon={GearIcon}
                        description={t("services.automation.description")}
                    />
                    <ServiceCard
                        title={t("services.development.title")}
                        icon={GridIcon}
                        description={t("services.development.description")}
                    />
                </Services>
            </Studio>
            <Separator size="4" />
            <Documentation origin={documentationOrigin} />
            <Separator size="4" />
            <NextSteps />
        </SiteLayout>
    );
}
