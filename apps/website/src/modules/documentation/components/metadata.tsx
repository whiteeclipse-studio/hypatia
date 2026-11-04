/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
/* Copyright © 2026 White Eclipse. Released under the MIT License. */
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
            <Table.Cell>{revision.date}</Table.Cell>
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
                <Button variant="outline" size="1">
                    {t(kind)}
                </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="760px">
                <Dialog.Title>{t(kind)}</Dialog.Title>
                <Dialog.Description>{document.title}</Dialog.Description>
                {kind === "licence" ? (
                    <DocumentContent tree={document.copyrightAndLicence} index={index} locale={locale} />
                ) : (
                    <div className="overflow-auto">
                        <Table.Root>
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
                    </div>
                )}
                <Dialog.Close>
                    <Button mt="4">{t("close")}</Button>
                </Dialog.Close>
            </Dialog.Content>
        </Dialog.Root>
    );
}
