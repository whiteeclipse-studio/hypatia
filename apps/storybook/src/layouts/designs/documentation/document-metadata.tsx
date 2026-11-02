/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Button, Dialog, Link, Table, Text } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";

/** The type of document metadata to disclose. */
interface MetadataProps {
    kind: "revisions" | "licence";
}

/**
 * Keeps revision history and licence notices separate from the article content.
 *
 * @param props - The metadata disclosure to render.
 * @returns A labelled trigger and accessible modal with fixture metadata.
 */
export function DocumentMetadata(props: MetadataProps): ReactElement {
    const { t } = useTranslation("documentation");
    const revisions = props.kind === "revisions";
    let label = t("metadata.copyright");
    let heading = "metadata.licence";
    if (revisions) {
        label = t("metadata.revision", { count: 3 });
        heading = "metadata.history";
    }
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button variant="outline" size="1">
                    {label}
                </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="620px">
                <Dialog.Title>{t(heading)}</Dialog.Title>
                <Dialog.Description size="2" color="gray" mb="5">
                    {t("metadata.sample")}
                </Dialog.Description>
                {revisions && (
                    <div
                        className="max-w-full overflow-x-auto"
                        role="region"
                        aria-label={t("metadata.history")}
                        tabIndex={0}
                    >
                        <Table.Root className="min-w-100">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>{t("metadata.number")}</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>{t("metadata.date")}</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>{t("metadata.editor")}</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>{t("metadata.change")}</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.RowHeaderCell>3</Table.RowHeaderCell>
                                    <Table.Cell>2026-10-29</Table.Cell>
                                    <Table.Cell>{t("metadata.sampleEditor")}</Table.Cell>
                                    <Table.Cell>{t("metadata.latest")}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.RowHeaderCell>2</Table.RowHeaderCell>
                                    <Table.Cell>2026-10-22</Table.Cell>
                                    <Table.Cell>{t("metadata.sampleEditor")}</Table.Cell>
                                    <Table.Cell>{t("metadata.previous")}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.RowHeaderCell>1</Table.RowHeaderCell>
                                    <Table.Cell>2026-10-15</Table.Cell>
                                    <Table.Cell>{t("metadata.sampleEditor")}</Table.Cell>
                                    <Table.Cell>{t("metadata.initial")}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table.Root>
                    </div>
                )}
                {!revisions && (
                    <div className="grid gap-3">
                        <Text as="p">Copyright © 2026 White Eclipse.</Text>
                        <Link href="https://whiteeclipse.dev/LICENCE">MIT License</Link>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <Dialog.Close>
                        <Button variant="soft">{t("common.close")}</Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}
