/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { type ReactElement, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { Select, Text, TextField } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import type { ProjectIndex } from "../domain/types";
import { navigationLinkClasses, NavigationTree } from "./navigation-tree";
import { projectHome, translatedEntry } from "../domain/routes";


/**
 * Displays project selection and filterable document navigation.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.indexes The indexes input.
 * @param props.index The index input.
 * @param props.onNavigate The onNavigate input.
 */
export function Navigation({
    indexes,
    index,
    onNavigate,
}: {
    indexes: ProjectIndex[];
    index: ProjectIndex;
    onNavigate?(this: void): void;
}): ReactElement {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const { locale } = useLocale();
    const { t } = useTranslation("website");
    const projects = indexes.map(item => (
        <Select.Item key={item.project.id} value={item.project.id}>
            {item.project.name}
        </Select.Item>
    ));
    const entries = index.entries.filter(
        entry =>
            entry.navigable &&
            entry.path.startsWith("docs/") &&
            `${entry.title} ${entry.path}`.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)),
    );
    const rootDepth = 2;
    const indentations = ["pl-3", "pl-5", "pl-7", "pl-9", "pl-11"];
    const links = entries.map(entry => {
        const translated = translatedEntry(index, entry, locale);
        return (
            <li key={entry.id}>
                <NavLink
                    to={entry.route}
                    end
                    onClick={onNavigate}
                    className={`${navigationLinkClasses} ${indentations[Math.min(Math.max(0, entry.path.split("/").length - rootDepth), indentations.length - 1)]}`}
                >
                    {translated.title}
                </NavLink>
            </li>
        );
    });
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex flex-col gap-3 border-b border-(--gray-6) px-3 py-4">
                <Text size="1" color="gray" className="text-[10px]! font-medium tracking-widest uppercase">
                    {t("project")}
                </Text>
                <Select.Root
                    value={index.project.id}
                    onValueChange={id => {
                        setQuery("");
                        void navigate(projectHome(id));
                        onNavigate?.();
                    }}
                >
                    <Select.Trigger aria-label={t("project")} />
                    <Select.Content>{projects}</Select.Content>
                </Select.Root>
            </div>
            <div className="min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto p-3">
                <TextField.Root
                    aria-label={t("filter")}
                    placeholder={t("filter")}
                    value={query}
                    onChange={event => {
                        setQuery(event.target.value);
                    }}
                />
                <nav aria-label={t("documentation")}>
                    {query === "" ? (
                        <NavigationTree index={index} locale={locale} onNavigate={onNavigate} />
                    ) : (
                        <ul className="my-3 list-none p-0">{links}</ul>
                    )}
                    {query !== "" && links.length === 0 && <p>{t("empty")}</p>}
                </nav>
            </div>
        </div>
    );
}
