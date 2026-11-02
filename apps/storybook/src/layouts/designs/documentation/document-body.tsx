/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Callout, Code, Heading, Link, Table, Text } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import type { ArticleId, PageId } from "./fixtures";

/** Current reading sample and local next-page action. */
interface DocumentBodyProps {
    page: ArticleId;
    onPage(page: PageId): void;
}

/**
 * Exercises long-form reading, code, tables, callouts, and cross-document navigation.
 *
 * @param props - The current illustrative article and local navigation action.
 * @returns Translated sample article content without a compiler or content service.
 */
export function DocumentBody(props: DocumentBodyProps): ReactElement {
    const { t } = useTranslation("documentation");
    let next: ArticleId = "getting-started";
    if (props.page === "getting-started") {
        next = "authoring";
    }
    /** Opens the other sample guide. */
    function continueReading(): void {
        props.onPage(next);
    }
    return (
        <div className="grid gap-9 text-base leading-8">
            <section aria-labelledby="document-orientation">
                <Heading as="h2" id="document-orientation" size="5" mb="4" className="scroll-mt-24">
                    {t("sections.orientation")}
                </Heading>
                <Text as="p" mb="5">
                    {t(`articles.${props.page}.orientation`)}
                </Text>
                <Callout.Root color="gray">
                    <Callout.Text>
                        <strong>{t("article.noteTitle")}</strong>
                        <br />
                        {t("article.noteBody")}
                    </Callout.Text>
                </Callout.Root>
            </section>
            <section aria-labelledby="document-structure">
                <Heading as="h2" id="document-structure" size="5" mb="4" className="scroll-mt-24">
                    {t("sections.structure")}
                </Heading>
                <Text as="p" mb="5">
                    {t(`articles.${props.page}.structure`)}
                </Text>
                <div className="min-w-0 border border-(--gray-6) bg-(--gray-2)">
                    <div className="flex justify-between border-b border-(--gray-6) px-4 py-2 text-xs text-(--gray-11)">
                        <span>{t("article.example")}</span>
                        <Code variant="ghost">text</Code>
                    </div>
                    <pre
                        className="m-0 overflow-x-auto p-5 font-(family-name:--code-font-family) text-xs leading-7"
                        tabIndex={0}
                        aria-label={t("article.example")}
                    >
                        <code>{`docs/\n├── public/\n│   ├── README.md\n│   └── getting-started.md\n└── assets/`}</code>
                    </pre>
                </div>
                <Heading as="h3" size="3" mt="6" mb="4">
                    {t("article.choose")}
                </Heading>
                <div className="max-w-full overflow-x-auto" role="region" aria-label={t("article.table")} tabIndex={0}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>{t("article.goal")}</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>{t("article.startWith")}</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.RowHeaderCell>{t("article.understand")}</Table.RowHeaderCell>
                                <Table.Cell>{t("pages.overview.title")}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.RowHeaderCell>{t("article.completeTask")}</Table.RowHeaderCell>
                                <Table.Cell>{t("pages.guides.title")}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.RowHeaderCell>{t("article.lookUp")}</Table.RowHeaderCell>
                                <Table.Cell>{t("article.reference")}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table.Root>
                </div>
            </section>
            <section aria-labelledby="document-next">
                <Heading as="h2" id="document-next" size="5" mb="4" className="scroll-mt-24">
                    {t("sections.next")}
                </Heading>
                <Text as="p" mb="4">
                    {t(`articles.${props.page}.next`)}
                </Text>
                <Link href="https://whiteeclipse.dev/" underline="always">
                    {t("article.liveReference")}
                </Link>
            </section>
            <div className="flex flex-col items-end gap-2 border-t border-(--gray-6) pt-6 text-right">
                <Text size="1" color="gray" className="uppercase tracking-widest">
                    {t("article.continue")}
                </Text>
                <button
                    type="button"
                    onClick={continueReading}
                    className="inline-flex max-w-full cursor-pointer items-center justify-end gap-3 py-2 text-right text-sm leading-6 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--gray-11)"
                >
                    <span>{t(`pages.${next}.title`)}</span>
                    <span aria-hidden="true" className="shrink-0 text-lg">
                        →
                    </span>
                </button>
            </div>
        </div>
    );
}
