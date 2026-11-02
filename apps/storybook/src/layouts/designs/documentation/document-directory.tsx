/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Button, Heading, Text } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { articleIds, type ArticleId, type NavigationProps } from "./fixtures";

/**
 * Presents a project overview or folder index with meaningful navigation actions.
 *
 * @param props - Current fixture state and local navigation actions.
 * @returns A directory of sample guides within the reading surface.
 */
export function DocumentDirectory(props: NavigationProps): ReactElement {
    const { t } = useTranslation("documentation");
    /**
     * Composes a guide entry and its local open action.
     *
     * @param page - The guide to display.
     * @returns A descriptive guide card.
     */
    function guide(page: ArticleId): ReactElement {
        /** Opens this sample guide. */
        function open(): void {
            props.onPage(page);
        }
        return (
            <section key={page} className="grid gap-4 border border-(--gray-6) bg-(--gray-2) p-5">
                <Heading as="h3" size="4">
                    {t(`pages.${page}.title`)}
                </Heading>
                <Text as="p" size="2" color="gray">
                    {t(`pages.${page}.description`)}
                </Text>
                <Button variant="outline" onClick={open} className="h-auto! w-fit py-2! text-left whitespace-normal!">
                    {t("common.read")} <span aria-hidden="true">→</span>
                </Button>
            </section>
        );
    }
    let description = "pages.guides.description";
    if (props.page === "overview") {
        description = `projects.${props.project}`;
    }
    const guides = articleIds.map(guide);
    return (
        <section id="document-directory" aria-labelledby="directory-heading" className="grid scroll-mt-24 gap-6">
            <Heading as="h2" id="directory-heading" size="5">
                {t("common.explore")}
            </Heading>
            <Text as="p" color="gray">
                {t(description)}
            </Text>
            <div className="grid gap-5">{guides}</div>
        </section>
    );
}
