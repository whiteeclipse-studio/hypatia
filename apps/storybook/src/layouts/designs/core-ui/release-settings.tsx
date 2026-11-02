/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Badge, Callout, Code, Heading, Kbd, Separator, Text } from "@radix-ui/themes";
import { Trans, useLocale, useTranslation } from "@whiteeclipse/i18next";
import { ReleaseForm } from "./release-form";

/**
 * Composes a release configuration form with operational context and help.
 *
 * @returns The exploratory release settings layout.
 */
export function ReleaseSettings(): ReactElement {
    const { t } = useTranslation("core-ui");
    const { locale } = useLocale();
    return (
        <main lang={locale} className="core-ui-background min-h-dvh p-4 sm:p-8 lg:p-12">
            <div className="mx-auto max-w-6xl">
                <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--gray-6) pb-5">
                    <Text size="2" weight="medium">
                        White Eclipse <span className="mx-2 text-(--gray-11)">/</span> Orbit
                    </Text>
                    <Badge variant="outline">{t("settings.label")}</Badge>
                </header>
                <div className="mb-8 max-w-2xl">
                    <Text size="1" color="gray" className="uppercase tracking-widest">
                        {t("settings.eyebrow")}
                    </Text>
                    <Heading as="h1" size={{ initial: "7", sm: "8" }} mt="3" mb="3">
                        {t("settings.title")}
                    </Heading>
                    <Text as="p" color="gray">
                        {t("settings.description")}
                    </Text>
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <ReleaseForm />
                    <aside
                        aria-label={t("settings.context")}
                        className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-1"
                    >
                        <Callout.Root color="amber">
                            <Callout.Text>
                                <strong>{t("settings.warningTitle")}</strong>
                                <br />
                                {t("settings.warningBody")}
                            </Callout.Text>
                        </Callout.Root>
                        <section className="border border-(--gray-6) bg-(--gray-2) p-6">
                            <Heading as="h2" size="4" mb="4">
                                {t("settings.context")}
                            </Heading>
                            <dl className="m-0 grid gap-4 text-sm">
                                <div>
                                    <dt className="text-(--gray-11)">{t("settings.project")}</dt>
                                    <dd className="m-0 mt-1">{t("settings.projectName")}</dd>
                                </div>
                                <div>
                                    <dt className="text-(--gray-11)">{t("settings.version")}</dt>
                                    <dd className="m-0 mt-1">
                                        <Code>0.8.0-preview.1</Code>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-(--gray-11)">{t("settings.reviewState")}</dt>
                                    <dd className="m-0 mt-2">
                                        <Badge color="gray">{t("common.draft")}</Badge>
                                    </dd>
                                </div>
                            </dl>
                            <Separator size="4" my="5" />
                            <Text as="p" size="1" color="gray">
                                <Trans ns="core-ui" i18nKey="settings.keyboard" components={{ key: <Kbd /> }} />
                            </Text>
                        </section>
                    </aside>
                </div>
                <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-(--gray-6) pt-5">
                    <Text size="1" color="gray">
                        {t("settings.footer")}
                    </Text>
                    <Text size="1" color="gray">
                        {t("common.disclaimer")}
                    </Text>
                </footer>
            </div>
        </main>
    );
}
