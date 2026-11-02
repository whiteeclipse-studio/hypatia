/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useId, useState, type ChangeEvent, type ReactElement } from "react";
import { IconButton, Select, Text, TextField } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { articleIds, type ArticleId, type PageId, type NavigationProps } from "./fixtures";

/**
 * Composes project selection, filtering, and a small document tree.
 *
 * @param props - Current fixture and local navigation actions.
 * @returns Project navigation reusable in the sidebar and mobile dialog.
 */
export function ProjectNavigation(props: NavigationProps): ReactElement {
    const { t } = useTranslation("documentation");
    const { locale } = useLocale();
    const [expanded, setExpanded] = useState(true);
    const [query, setQuery] = useState("");
    const treeId = useId();
    const projectLabel = useId();
    /**
     * Changes the fixture project and clears the previous project's filter.
     *
     * @param value - The selected project identifier.
     */
    function selectProject(value: string): void {
        if (value === "hypatia" || value === "ryugu") {
            setQuery("");
            props.onProject(value);
        }
    }
    /**
     * Filters the translated document names.
     *
     * @param event - The filter field change.
     */
    function search(event: ChangeEvent<HTMLInputElement>): void {
        setQuery(event.currentTarget.value);
        setExpanded(true);
    }
    /** Opens the project index. */
    function overview(): void {
        props.onPage("overview");
    }
    /** Opens the guide-folder index without changing its expansion state. */
    function guides(): void {
        props.onPage("guides");
    }
    /** Expands or collapses descendants without selecting a page. */
    function toggle(): void {
        setExpanded(!expanded);
    }
    /**
     * Checks a translated article name against the filter.
     *
     * @param page - A fixture article identifier.
     * @returns Whether this article matches the current filter.
     */
    function matches(page: ArticleId): boolean {
        return t(`pages.${page}.title`).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale));
    }
    /**
     * Identifies the selected page for assistive technology.
     *
     * @param page - The navigation target.
     * @returns The page marker when this target is selected.
     */
    function currentPage(page: PageId): "page" | undefined {
        if (props.page === page) {
            return "page";
        }
        return undefined;
    }
    /**
     * Presents one local document navigation action.
     *
     * @param page - The article to select.
     * @returns A document navigation row.
     */
    function item(page: ArticleId): ReactElement {
        /** Selects this fixture article. */
        function select(): void {
            props.onPage(page);
        }
        return (
            <li key={page}>
                <button
                    type="button"
                    onClick={select}
                    aria-current={currentPage(page)}
                    className="my-1 flex min-h-8 w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-xs leading-5 hover:bg-(--gray-4) focus-visible:outline-2 focus-visible:outline-(--gray-11) aria-[current=page]:bg-(--gray-12) aria-[current=page]:text-(--gray-1)"
                >
                    <span aria-hidden="true" className="flex size-1.5 shrink-0 items-center">
                        {props.page === page && <span className="block size-1.5 bg-current" />}
                    </span>
                    <span>{t(`pages.${page}.title`)}</span>
                </button>
            </li>
        );
    }
    const expansion = { label: "nav.expand", symbol: "+" };
    if (expanded) {
        expansion.label = "nav.collapse";
        expansion.symbol = "−";
    }
    const items = articleIds.filter(matches).map(item);
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="grid gap-3 border-b border-(--gray-6) px-3 py-4">
                <Text
                    id={projectLabel}
                    size="1"
                    color="gray"
                    className="text-[10px]! font-medium uppercase tracking-widest"
                >
                    {t("nav.project")}
                </Text>
                <Select.Root value={props.project} onValueChange={selectProject}>
                    <Select.Trigger aria-labelledby={projectLabel} />
                    <Select.Content>
                        <Select.Item value="hypatia">Hypatia</Select.Item>
                        <Select.Item value="ryugu">Ryugu</Select.Item>
                    </Select.Content>
                </Select.Root>
                <Text size="1" color="gray">
                    {t(`projects.${props.project}`)}
                </Text>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-gutter:stable]">
                <TextField.Root
                    aria-label={t("nav.search")}
                    placeholder={t("nav.searchPlaceholder")}
                    value={query}
                    onChange={search}
                    mb="3"
                />
                <nav aria-label={t("nav.tree")}>
                    <button
                        type="button"
                        onClick={overview}
                        aria-current={currentPage("overview")}
                        className="flex min-h-8 w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-[13px] leading-5 hover:bg-(--gray-4) focus-visible:outline-2 focus-visible:outline-(--gray-11) aria-[current=page]:bg-(--gray-12) aria-[current=page]:text-(--gray-1)"
                    >
                        <span aria-hidden="true" className="flex size-1.5 shrink-0 items-center">
                            <span className="block size-1.5 bg-current" />
                        </span>
                        <span>{t("pages.overview.title")}</span>
                    </button>
                    <div className="mt-2 flex items-center has-[[aria-current=page]]:bg-(--gray-12) has-[[aria-current=page]]:text-(--gray-1)">
                        <IconButton
                            variant="ghost"
                            size="1"
                            className="relative mx-2.5! my-0! box-border! size-3! shrink-0 p-0! text-inherit! [--core-ui-border-color:currentColor] [--corner-x:3px] [--corner-y:3px] after:absolute after:-inset-2.5 after:content-[''] hover:[--corner-x:50%] hover:[--corner-y:50%] focus-visible:[--corner-x:50%] focus-visible:[--corner-y:50%]"
                            aria-label={t(expansion.label)}
                            aria-expanded={expanded}
                            aria-controls={treeId}
                            onClick={toggle}
                        >
                            <span aria-hidden="true" className="text-[10px] leading-none">
                                {expansion.symbol}
                            </span>
                        </IconButton>
                        <button
                            type="button"
                            onClick={guides}
                            aria-current={currentPage("guides")}
                            className="min-h-8 min-w-0 flex-1 cursor-pointer py-1.5 pr-2 text-left text-[13px] leading-5 hover:bg-(--gray-6)/30 focus-visible:outline-2 focus-visible:outline-(--gray-11)"
                        >
                            {t("pages.guides.title")}
                        </button>
                    </div>
                    <ul id={treeId} hidden={!expanded} className="mt-1 ml-6 list-none">
                        {items}
                    </ul>
                    {items.length === 0 && (
                        <Text as="p" size="2" color="gray" mt="4" role="status">
                            {t("nav.empty")}
                        </Text>
                    )}
                </nav>
            </div>
            <div className="border-t border-(--gray-6) p-5">
                <Text as="p" size="1" color="gray">
                    {t("common.prototype")}
                </Text>
            </div>
        </div>
    );
}
