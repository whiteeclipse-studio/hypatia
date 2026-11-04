/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { useTranslation } from "@whiteeclipse/i18next";
import { translatedEntry } from "../domain/routes";
import type { DocumentData, ProjectIndex } from "../domain/types";


/**
 * Renders authored document relationships using the target's localized title and route.
 *
 * @param props Document navigation, project inventory, language, and placement.
 * @param props.document Selected document variant.
 * @param props.index Project inventory used to resolve published targets.
 * @param props.locale Preferred target language.
 * @param props.position Parent links appear above the title; sequence links follow the article.
 * @returns Available links, or nothing when no published targets resolve.
 */
export function DocumentNavigation({
    document,
    index,
    locale,
    position,
}: {
    document: DocumentData;
    index: ProjectIndex;
    locale: string;
    position: "top" | "bottom";
}): ReactElement | null {
    const { t } = useTranslation("website");
    const relations = { parent: "up", previous: "prev", next: "next" } as const;
    const icons = { parent: ArrowUpIcon, previous: ArrowLeftIcon, next: ArrowRightIcon };
    const fields = position === "top" ? (["parent"] as const) : (["previous", "next"] as const);
    const links = fields.flatMap(field => {
        const path = document.navigation?.[field];
        const target = index.entries.find(entry => entry.path === path);
        if (target === undefined) {
            return [];
        }
        const entry = translatedEntry(index, target, locale);
        const parent = field === "parent";
        const next = field === "next";
        const Icon = icons[field];
        return [
            <Link
                key={field}
                to={entry.route}
                rel={relations[field]}
                aria-label={`${t(field)}: ${entry.title}`}
                className={`flex min-w-0 flex-col gap-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--gray-11) ${parent ? "py-1 text-xs leading-5" : "py-2 text-sm leading-6"} ${next ? "col-start-2 items-end text-right" : "items-start"}`}
            >
                {!parent && <span className="text-xs tracking-widest text-(--gray-11) uppercase">{t(field)}</span>}
                <span className={`inline-flex max-w-full items-center ${parent ? "gap-2" : "gap-3"}`}>
                    {!next && <Icon aria-hidden="true" className={`shrink-0 ${parent ? "size-3" : "size-4"}`} />}
                    <span className="min-w-0 wrap-anywhere">{entry.title}</span>
                    {next && <Icon aria-hidden="true" className="size-4 shrink-0" />}
                </span>
            </Link>,
        ];
    });
    if (links.length === 0) {
        return null;
    }
    return (
        <nav
            aria-label={position === "top" ? t("parent") : t("documentNavigation")}
            className={position === "top" ? "mb-5" : "mt-9 grid grid-cols-2 gap-6 border-t border-(--gray-6) pt-6"}
        >
            {links}
        </nav>
    );
}
