/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { useTranslation } from "react-i18next";
import { useEffect, type ReactElement } from "react";
import { Separator } from "@whiteeclipse/core-ui";
import { SiteLayout } from "../../layouts/site/site-layout";
import { Hero } from "../../layouts/landing/hero";
import { Studio } from "../../layouts/landing/studio";
import { NextSteps } from "../../layouts/landing/next-steps";
import { Services } from "../../layouts/landing/services";
import { ServiceCard } from "../../components/service-card/service-card";
import { faCode, faGears, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons";
import { faClone } from "@fortawesome/free-regular-svg-icons";

/**
 * Selects the landing page's section order and supplies its illustrative service content.
 *
 * @returns The exploratory landing page within the shared site layout.
 */
export function LandingPage(): ReactElement {
    const { t } = useTranslation("landing");
    useEffect(() => {
        document.title = t("metadata.title");
        document
            .querySelector<HTMLMetaElement>('meta[name="description"]')
            ?.setAttribute("content", t("metadata.description"));
    }, [t]);
    return (
        <SiteLayout>
            <Hero />
            <Separator size="4" />
            <Studio>
                <Services>
                    <ServiceCard
                        title={t("services.consulting.title")}
                        icon={faClone}
                        description={t("services.consulting.description")}
                    />
                    <ServiceCard
                        title={t("services.modernisation.title")}
                        icon={faCode}
                        description={t("services.modernisation.description")}
                    />
                    <ServiceCard
                        title={t("services.automation.title")}
                        icon={faGears}
                        description={t("services.automation.description")}
                    />
                    <ServiceCard
                        title={t("services.development.title")}
                        icon={faTableCellsLarge}
                        description={t("services.development.description")}
                    />
                </Services>
            </Studio>
            <Separator size="4" />
            <NextSteps />
        </SiteLayout>
    );
}
