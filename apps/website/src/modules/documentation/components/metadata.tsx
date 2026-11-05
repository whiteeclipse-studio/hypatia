/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { CounterClockwiseClockIcon } from "@radix-ui/react-icons";
import { Button, Dialog, Table } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import type { DocumentData, ProjectIndex } from "../domain/types";
import { DocumentContent } from "./document-content";


/**
 * Displays the document notice or revision history in an accessible dialog.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.document The document input.
 * @param props.index The index input.
 * @param props.locale The locale input.
 * @param props.kind The kind input.
 */
export function Metadata({
    document,
    index,
    locale,
    kind,
}: {
    document: DocumentData;
    index: ProjectIndex;
    locale: string;
    kind: "licence" | "revisions";
}): ReactElement {
    const { t } = useTranslation("website");
    const rows = document.revisions.map(revision => (
        <Table.Row key={revision.revision}>
            <Table.RowHeaderCell>{revision.revision}</Table.RowHeaderCell>
            <Table.Cell className="whitespace-nowrap">{revision.date}</Table.Cell>
            <Table.Cell>
                <DocumentContent tree={revision.author} index={index} locale={locale} />
            </Table.Cell>
            <Table.Cell>
                <DocumentContent tree={revision.description} index={index} locale={locale} />
            </Table.Cell>
        </Table.Row>
    ));
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button
                    variant="outline"
                    size="1"
                    aria-label={t(kind)}
                    className="min-h-7 min-w-7 md:min-h-0 md:min-w-0"
                >
                    {kind === "revisions" ? (
                        <>
                            <CounterClockwiseClockIcon aria-hidden="true" className="size-3 md:hidden" />
                            <span className="hidden md:inline">{t(kind)}</span>
                        </>
                    ) : (
                        t(kind)
                    )}
                </Button>
            </Dialog.Trigger>
            <Dialog.Content
                maxWidth="min(760px, calc(100vw - 2rem - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)))"
                className="flex max-h-[calc(100dvh-2*max(var(--space-6),6vh)-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] min-w-0 flex-col overflow-hidden"
            >
                <Dialog.Title className="shrink-0 wrap-anywhere">{t(kind)}</Dialog.Title>
                <Dialog.Description className="shrink-0 wrap-anywhere">{document.title}</Dialog.Description>
                <div
                    role="region"
                    aria-label={t(kind)}
                    tabIndex={0}
                    className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--gray-11)"
                >
                    {kind === "licence" ? (
                        <DocumentContent tree={document.copyrightAndLicence} index={index} locale={locale} />
                    ) : (
                        <Table.Root className="min-w-[40rem]">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>{t("revision")}</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>{t("date")}</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>{t("author")}</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>{t("description")}</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>{rows}</Table.Body>
                        </Table.Root>
                    )}
                </div>
                <Dialog.Close>
                    <Button mt="4" className="shrink-0 self-start">
                        {t("close")}
                    </Button>
                </Dialog.Close>
            </Dialog.Content>
        </Dialog.Root>
    );
}
