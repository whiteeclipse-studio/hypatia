/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Badge, Button, Dialog, Heading, Text } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { pagePresentation, projectNames, type PageId, type ProjectId } from "./fixtures";
import { ProjectNavigation } from "./project-navigation";
import { DocumentMetadata } from "./document-metadata";
import { PageContents } from "./page-contents";
import { DocumentBody } from "./document-body";
import { DocumentDirectory } from "./document-directory";
import { ReaderHeader } from "./reader-header";
import { ReaderFooter, type ReaderFooterProps } from "./reader-footer";
import { useActiveSection } from "./use-active-section";

/** Predefined entry points for reviewing the documentation layout. */
export interface DocumentationReaderProps extends ReaderFooterProps {
    initialPage: PageId;
}

/**
 * Composes a responsive documentation reader from Core UI and illustrative fixture content.
 *
 * @param props - The initial document or directory to review.
 * @returns An exploratory documentation site with independent reading and navigation panes.
 */
export function DocumentationReader(props: DocumentationReaderProps): ReactElement {
    const { t } = useTranslation("documentation");
    const { locale } = useLocale();
    const [project, setProject] = useState<ProjectId>("hypatia");
    const [page, setPage] = useState(props.initialPage);
    const [mobileOpen, setMobileOpen] = useState(false);
    const reader = useRef<HTMLElement>(null);
    const activeSection = useActiveSection(reader, page);
    const navigated = useRef(false);
    const mobileSelection = useRef(false);
    const presentation = pagePresentation(page);
    /**
     * Selects a document and dismisses narrow-screen navigation.
     *
     * @param next - The document to open.
     */
    function navigate(next: PageId): void {
        navigated.current = true;
        mobileSelection.current = mobileOpen;
        setPage(next);
        setMobileOpen(false);
    }
    /**
     * Selects the fixture project and opens its overview.
     *
     * @param next - A project represented by the prototype.
     */
    function changeProject(next: ProjectId): void {
        setProject(next);
        navigate("overview");
    }
    /** Returns to the current project's overview. */
    function home(): void {
        navigate("overview");
    }
    /** Focuses the document after a local page change without taking focus on initial load. */
    function focusAfterNavigation(): void {
        if (navigated.current) {
            reader.current?.scrollTo({ top: 0 });
            if (!mobileSelection.current) {
                reader.current?.focus();
            }
            navigated.current = false;
        }
    }
    useEffect(focusAfterNavigation, [page, project]);
    /**
     * Restores focus to the reading pane after selecting a document in the mobile dialog.
     *
     * @param event - Radix's automatic close-focus event.
     */
    function closeFocus(event: Event): void {
        if (mobileSelection.current) {
            event.preventDefault();
            reader.current?.focus();
            mobileSelection.current = false;
        }
    }
    const navigation = { project, page, onProject: changeProject, onPage: navigate };
    return (
        <div lang={locale} className="core-ui-background flex h-dvh flex-col overflow-hidden text-(--gray-12)">
            <a
                href="#documentation-content"
                className="fixed -top-30 left-4 z-50 bg-(--gray-1) p-3 focus:top-3 focus-visible:outline-2 focus-visible:outline-(--gray-11)"
            >
                {t("common.skip")}
            </a>
            <ReaderHeader onHome={home} />
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-(--gray-6) bg-(--gray-2) px-5 py-3 md:hidden">
                <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                    <Dialog.Trigger>
                        <Button variant="ghost">{t("nav.browse")}</Button>
                    </Dialog.Trigger>
                    <Dialog.Content
                        maxWidth="420px"
                        className="flex max-h-[85dvh] flex-col"
                        onCloseAutoFocus={closeFocus}
                    >
                        <Dialog.Title>{t("nav.browse")}</Dialog.Title>
                        <Dialog.Description size="1" mb="4">
                            {t("nav.description")}
                        </Dialog.Description>
                        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
                            <ProjectNavigation {...navigation} />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Dialog.Close>
                                <Button variant="soft">{t("common.close")}</Button>
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
                </Dialog.Root>
                <Text size="1" color="gray">
                    {projectNames[project]}
                </Text>
            </div>
            <div className="mx-auto grid min-h-0 w-full max-w-375 flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[252px_minmax(0,1fr)] min-[68.75rem]:grid-cols-[252px_minmax(0,1fr)_192px]">
                <aside
                    aria-label={t("nav.tree")}
                    className="hidden min-h-0 flex-col border-x border-(--gray-6) bg-(--gray-2) md:flex"
                >
                    <ProjectNavigation {...navigation} />
                </aside>
                <main
                    id="documentation-content"
                    aria-labelledby="document-title"
                    tabIndex={-1}
                    ref={reader}
                    className="min-h-0 min-w-0 overflow-y-auto bg-(--gray-1) [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--gray-11) motion-safe:scroll-smooth"
                >
                    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-(--gray-6) bg-(--gray-1) px-6 py-4 text-xs text-(--gray-11) sm:px-8">
                        <nav aria-label={t("common.breadcrumb")} className="flex min-w-0 flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={home}
                                className="cursor-pointer underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-(--gray-11)"
                            >
                                {projectNames[project]}
                            </button>
                            <span aria-hidden="true">/</span>
                            <span>{t(presentation.breadcrumb)}</span>
                        </nav>
                        <DocumentMetadata kind="revisions" />
                    </div>
                    <div className="mx-auto max-w-[76ch] px-6 pt-10 pb-7 sm:px-10 sm:pt-12">
                        <article aria-labelledby="document-title">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <Text size="1" color="gray" className="uppercase tracking-widest">
                                    {t(presentation.category)}
                                </Text>
                                <Badge variant="outline">{t("common.sample")}</Badge>
                            </div>
                            <Heading
                                as="h1"
                                id="document-title"
                                size={{ initial: "7", sm: "8" }}
                                mb="5"
                                className="text-balance"
                            >
                                {t(`pages.${page}.title`)}
                            </Heading>
                            <Text as="p" size="3" color="gray" className="mb-7! leading-8!">
                                {t(`pages.${page}.description`)}
                            </Text>
                            {locale !== "en" && (
                                <Text as="p" size="1" color="gray" mb="5">
                                    {t("common.translation")}
                                </Text>
                            )}
                            <details className="mb-8 border-y border-(--gray-6) py-4 text-sm min-[68.75rem]:hidden">
                                <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-(--gray-11)">
                                    {t("common.contents")}
                                </summary>
                                <div className="pt-5">
                                    <PageContents page={page} activeSection={activeSection} />
                                </div>
                            </details>
                            <div className="border-t border-(--gray-6) pt-8">
                                {presentation.directory && <DocumentDirectory {...navigation} />}
                                {(page === "getting-started" || page === "authoring") && (
                                    <DocumentBody page={page} onPage={navigate} />
                                )}
                            </div>
                        </article>
                        <footer className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-(--gray-6) pt-6">
                            <DocumentMetadata kind="licence" />
                            <Text size="1" color="gray">
                                {t("common.prototype")}
                            </Text>
                        </footer>
                    </div>
                </main>
                <aside
                    aria-label={t("common.contents")}
                    className="hidden min-h-0 overflow-y-auto border-l border-(--gray-6) px-5 py-10 min-[68.75rem]:block"
                >
                    <PageContents page={page} activeSection={activeSection} />
                    <div className="mt-10 border-t border-(--gray-6) pt-5">
                        <Text as="p" size="1" color="gray">
                            {t("common.tagline")}
                        </Text>
                    </div>
                </aside>
            </div>
            <ReaderFooter onLocaleChange={props.onLocaleChange} />
        </div>
    );
}
