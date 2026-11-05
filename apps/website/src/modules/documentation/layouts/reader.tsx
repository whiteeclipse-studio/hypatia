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
            <div className="flex items-center justify-between border-b border-(--gray-6) bg-(--gray-2) py-3 pr-[calc(1.25rem+env(safe-area-inset-right,0px))] pl-[calc(1.25rem+env(safe-area-inset-left,0px))] md:hidden">
                <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                    <Dialog.Trigger>
                        <Button variant="ghost" className="px-3 py-1">
                            {t("browse")}
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Content
                        maxWidth="min(420px, calc(100vw - 2rem - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)))"
                        className="flex max-h-[calc(100dvh-2*max(var(--space-6),6vh)-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex-col overflow-hidden"
                        onCloseAutoFocus={event => {
                            event.preventDefault();
                            main.current?.focus();
                        }}
                    >
                        <Dialog.Title className="shrink-0">{t("browse")}</Dialog.Title>
                        <Dialog.Description className="shrink-0">{t("project")}</Dialog.Description>
                        <div className="min-h-0 flex-1 overflow-auto overscroll-contain">{navigation}</div>
                        <Dialog.Close>
                            <Button className="shrink-0 self-start">{t("close")}</Button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Root>
                <Text size="1">{index.project.name}</Text>
            </div>
            <div className="mx-auto grid min-h-0 w-full max-w-375 flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[calc(252px+env(safe-area-inset-left,0px))_minmax(0,1fr)] min-[68.75rem]:grid-cols-[calc(252px+env(safe-area-inset-left,0px))_minmax(0,1fr)_calc(192px+env(safe-area-inset-right,0px))]">
                <aside className="hidden min-h-0 border-x border-(--gray-6) bg-(--gray-2) md:block md:pl-[env(safe-area-inset-left,0px)]">
                    {navigation}
                </aside>
                <main
                    id="documentation-content"
                    tabIndex={-1}
                    ref={main}
                    className="min-h-0 min-w-0 scrollbar-gutter-stable overflow-y-auto focus:outline-none motion-safe:scroll-smooth"
                    aria-busy={state.loading[key] ?? false}
                >
                    <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-(--gray-6) bg-(--gray-3) pr-[calc(0.5rem+env(safe-area-inset-right,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] text-xs text-(--gray-11) md:flex-wrap md:gap-4 md:py-2 md:pr-[calc(0.5rem+env(safe-area-inset-right,0px))] md:pl-8 min-[68.75rem]:pr-8 [&_a]:text-inherit">
                        <Breadcrumbs
                            index={index}
                            route={route}
                            locale={locale}
                            title={document?.title ?? page?.title}
                        />
                        <div className="flex shrink-0 items-center gap-3">
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
                    <div className="mx-auto max-w-[76ch] py-5 pr-[calc(1.5rem+env(safe-area-inset-right,0px))] pl-[calc(1.5rem+env(safe-area-inset-left,0px))] md:pt-12 md:pr-[calc(2.5rem+env(safe-area-inset-right,0px))] md:pl-10 min-[68.75rem]:pr-10">
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
                                </div>
                            </>
                        )}
                    </div>
                </main>
                <aside className="hidden overflow-y-auto border-l border-(--gray-6) py-10 pl-5 text-xs min-[68.75rem]:block min-[68.75rem]:pr-[calc(1.25rem+env(safe-area-inset-right,0px))]">
                    <Text size="1" color="gray" className="tracking-widest uppercase">
                        {t("contents")}
                    </Text>
                    {document !== undefined && <Contents tree={document.tree} active={activeSection} />}
                </aside>
            </div>
        </>
    );
}
