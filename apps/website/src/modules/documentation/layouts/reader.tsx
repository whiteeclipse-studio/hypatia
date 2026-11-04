/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { type ReactElement, useEffect, useState } from "react";
import { Button, Dialog, Heading, Text } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { Breadcrumbs } from "../components/breadcrumbs";
import { selectDocument } from "../domain/select-document";
import { useDocumentation } from "../store/use-documentation";
import { pageKey, type ProjectIndex } from "../domain/types";
import { DocumentBody } from "../components/document-body";
import { DocumentContent } from "../components/document-content";
import { DocumentNavigation } from "../components/document-navigation";
import { DirectoryListing } from "../components/directory-listing";
import { Navigation } from "../components/navigation";
import { Contents } from "../components/contents";
import { Metadata } from "../components/metadata";
import { useReadingPane } from "./use-reading-pane";


/**
 * Renders the responsive documentation reader for one route.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.index The index input.
 * @param props.route The route input.
 */
export function Reader({ index, route }: { index: ProjectIndex; route: string }): ReactElement {
    const { state, store } = useDocumentation();
    const { locale } = useLocale();
    const { t } = useTranslation("website");
    const key = pageKey(index, route);
    const page = state.pages[key];
    const selected = selectDocument(page, locale);
    const document = selected?.document;
    const [mobileOpen, setMobileOpen] = useState(false);
    const { main, activeSection } = useReadingPane(page, document, index.project.name);
    useEffect(() => {
        store.ensureProject(index);
        void store.ensurePage(index, route);
    }, [store, index, route]);
    const navigation = (
        <Navigation
            indexes={state.indexes}
            index={index}
            onNavigate={() => {
                setMobileOpen(false);
            }}
        />
    );
    return (
        <>
            <div className="flex items-center justify-between border-b border-(--gray-6) bg-(--gray-2) px-5 py-3 md:hidden">
                <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                    <Dialog.Trigger>
                        <Button variant="ghost">{t("browse")}</Button>
                    </Dialog.Trigger>
                    <Dialog.Content
                        maxWidth="420px"
                        className="flex max-h-[85dvh] flex-col [&_nav]:overflow-auto"
                        onCloseAutoFocus={event => {
                            event.preventDefault();
                            main.current?.focus();
                        }}
                    >
                        <Dialog.Title>{t("browse")}</Dialog.Title>
                        <Dialog.Description>{t("project")}</Dialog.Description>
                        {navigation}
                        <Dialog.Close>
                            <Button>{t("close")}</Button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Root>
                <Text size="1">{index.project.name}</Text>
            </div>
            <div className="mx-auto grid min-h-0 w-full max-w-375 flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[252px_minmax(0,1fr)] min-[68.75rem]:grid-cols-[252px_minmax(0,1fr)_192px]">
                <aside className="hidden min-h-0 border-x border-(--gray-6) bg-(--gray-2) md:block">{navigation}</aside>
                <main
                    id="documentation-content"
                    tabIndex={-1}
                    ref={main}
                    className="min-h-0 min-w-0 [scrollbar-gutter:stable] overflow-y-auto bg-(--gray-1) focus:outline-none motion-safe:scroll-smooth"
                    aria-busy={state.loading[key] ?? false}
                >
                    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--gray-6) bg-(--gray-1) px-8 py-4 text-xs text-(--gray-11) [&_a]:text-inherit">
                        <Breadcrumbs
                            index={index}
                            route={route}
                            locale={locale}
                            title={document?.title ?? page?.title}
                        />
                        <div className="flex items-center gap-3">
                            {document !== undefined && (
                                <Metadata kind="revisions" document={document} index={index} locale={locale} />
                            )}
                        </div>
                    </div>
                    {state.errors[index.project.id] !== undefined && (
                        <p className="border-b border-(--gray-6) p-4 text-sm text-(--gray-11)" role="status">
                            {t("updateFailed")} {state.errors[index.project.id]}
                        </p>
                    )}
                    <div className="mx-auto max-w-[76ch] px-6 py-8 md:px-10 md:pt-12">
                        {page === undefined ? (
                            <div role="status">
                                {state.errors[key] ?? (
                                    <>
                                        <div className="mb-6 h-12 w-[65%] bg-(--gray-3)" />
                                        <div className="mb-6 h-6 bg-(--gray-3)" />
                                        <div className="mb-6 h-6 bg-(--gray-3)" />
                                        <span>{t("loading")}</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <article aria-labelledby="document-title" lang={selected?.locale ?? locale}>
                                    {document !== undefined && (
                                        <DocumentNavigation
                                            document={document}
                                            index={index}
                                            locale={locale}
                                            position="top"
                                        />
                                    )}
                                    <Heading as="h1" id="document-title" size={{ initial: "7", sm: "8" }} mt="4" mb="6">
                                        {document?.title ?? page.title}
                                    </Heading>
                                    {!page.directory &&
                                        locale !== "en" &&
                                        page.variants[locale] === undefined &&
                                        page.variants[locale.split("-")[0] ?? ""] === undefined && (
                                            <p className="border-b border-(--gray-6) p-4 text-sm text-(--gray-11)">
                                                {t("englishFallback")}
                                            </p>
                                        )}
                                    {document !== undefined && (
                                        <>
                                            <details className="mb-6 block border-y border-(--gray-6) py-4 min-[68.75rem]:hidden">
                                                <summary>{t("contents")}</summary>
                                                <Contents tree={document.tree} active={activeSection} />
                                            </details>
                                            <DocumentBody>
                                                <DocumentContent tree={document.tree} index={index} locale={locale} />
                                            </DocumentBody>
                                        </>
                                    )}
                                    {page.directory && <DirectoryListing index={index} route={route} locale={locale} />}
                                    {document !== undefined && (
                                        <DocumentNavigation
                                            document={document}
                                            index={index}
                                            locale={locale}
                                            position="bottom"
                                        />
                                    )}
                                </article>
                                <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-(--gray-6) pt-6">
                                    {document !== undefined && (
                                        <Metadata kind="licence" document={document} index={index} locale={locale} />
                                    )}
                                    <Text size="1" color="gray">
                                        {t("exploratory")}
                                    </Text>
                                </div>
                            </>
                        )}
                    </div>
                </main>
                <aside className="hidden overflow-y-auto border-l border-(--gray-6) px-5 py-10 text-xs min-[68.75rem]:block">
                    <Text size="1" color="gray" className="tracking-widest uppercase">
                        {t("contents")}
                    </Text>
                    {document !== undefined && <Contents tree={document.tree} active={activeSection} />}
                </aside>
            </div>
        </>
    );
}
