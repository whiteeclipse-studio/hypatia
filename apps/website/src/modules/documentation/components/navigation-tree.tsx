/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { type ReactElement, useEffect, useId, useState } from "react";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { NavLink, useLocation } from "react-router";
import type { ProjectIndex } from "../domain/types";
import { directoryTitle } from "../domain/directory-title";
import { projectHome, translatedEntry } from "../domain/routes";


/** Shared navigation-row appearance for tree entries and search results. */
export const navigationLinkClasses =
    "group flex min-h-8 items-center gap-2 px-2 py-1.5 text-[13px] leading-normal text-inherit no-underline [overflow-wrap:anywhere] hover:bg-(--gray-4) aria-[current=page]:bg-(--gray-12) aria-[current=page]:text-(--gray-1)";

/** One canonical page or synthetic folder in the project navigation. */
interface NavigationNode {
    route: string;
    title: string;
    children: Map<string, NavigationNode>;
}

/**
 * Sorts each level with expandable folders first and leaf pages afterward.
 *
 * @param node An independently owned navigation branch.
 * @param collator Alphabetical ordering for the current document language.
 * @returns A tree ordered at every level without changing its source nodes.
 */
function sortNavigation(node: NavigationNode, collator: Intl.Collator): NavigationNode {
    const children = [...node.children.entries()].sort(([, left], [, right]) => {
        const foldersFirst = Number(right.children.size > 0) - Number(left.children.size > 0);
        if (foldersFirst !== 0) {
            return foldersFirst;
        }
        const alphabetical = collator.compare(left.title, right.title);
        return alphabetical === 0 ? left.route.localeCompare(right.route) : alphabetical;
    });
    return {
        ...node,
        children: new Map(children.map(([segment, child]) => [segment, sortNavigation(child, collator)])),
    };
}

/**
 * Groups canonical entries into folders without duplicating README links.
 *
 * @param index Active project inventory.
 * @param locale Requested document language.
 * @returns A navigation root with deterministic child order.
 */
function navigationTree(index: ProjectIndex, locale: string): NavigationNode {
    const root: NavigationNode = {
        route: projectHome(index.project.id),
        title: index.project.name,
        children: new Map(),
    };
    for (const entry of index.entries.filter(item => item.navigable && item.path.startsWith("docs/"))) {
        let node = root;
        for (const segment of entry.route.slice(root.route.length).split("/").filter(Boolean)) {
            const child = node.children.get(segment) ?? {
                route: `${node.route}${segment}/`,
                title: directoryTitle(segment),
                children: new Map<string, NavigationNode>(),
            };
            node.children.set(segment, child);
            node = child;
        }
        node.title = translatedEntry(index, entry, locale).title;
    }
    return sortNavigation(root, new Intl.Collator(locale, { sensitivity: "base" }));
}

/**
 * Renders one expandable navigation branch and its directory link.
 *
 * @param props Branch state and navigation callback.
 * @param props.node Current navigation node.
 * @param props.onNavigate Optional mobile-dialog dismissal.
 * @returns An accessible folder or document navigation item.
 */
function Branch({
    node,
    onNavigate,
}: {
    node: NavigationNode;
    onNavigate: ((this: void) => void) | undefined;
}): ReactElement {
    const { pathname } = useLocation();
    const [expanded, setExpanded] = useState(pathname.startsWith(node.route));
    useEffect(() => {
        if (pathname.startsWith(node.route)) {
            setExpanded(true);
        }
    }, [pathname, node.route]);
    const treeId = useId();
    const { t } = useTranslation("website");
    const children = [...node.children.values()].map(child => (
        <Branch key={child.route} node={child} onNavigate={onNavigate} />
    ));
    const link = (
        <NavLink to={node.route} end onClick={onNavigate} className={navigationLinkClasses}>
            <span className="size-1.5 shrink-0 group-aria-[current=page]:bg-current" aria-hidden="true" />
            <span>{node.title}</span>
        </NavLink>
    );
    if (children.length === 0) {
        return <li>{link}</li>;
    }
    return (
        <li>
            <div className="flex items-center has-[[aria-current=page]]:bg-(--gray-12) has-[[aria-current=page]]:text-(--gray-1)">
                <IconButton
                    variant="ghost"
                    size="1"
                    className="relative mx-[5px]! my-0! box-border! size-3! min-w-3! shrink-0 p-0! text-[10px]! leading-none text-inherit! [--core-ui-border-color:currentColor] [--corner-x:3px] [--corner-y:3px] after:absolute after:-inset-2.5 after:content-[''] hover:[--corner-x:50%] hover:[--corner-y:50%] focus-visible:[--corner-x:50%] focus-visible:[--corner-y:50%]"
                    aria-label={t(expanded ? "collapse" : "expand", { title: node.title })}
                    aria-expanded={expanded}
                    aria-controls={treeId}
                    onClick={() => {
                        setExpanded(!expanded);
                    }}
                >
                    <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                </IconButton>
                <NavLink
                    to={node.route}
                    end
                    onClick={() => {
                        setExpanded(true);
                        onNavigate?.();
                    }}
                    className={`${navigationLinkClasses} min-w-0 flex-1 bg-transparent! pl-0 text-inherit!`}
                >
                    {node.title}
                </NavLink>
            </div>
            <ul id={treeId} hidden={!expanded}>
                {children}
            </ul>
        </li>
    );
}

/**
 * Displays the canonical folder tree using localized document labels.
 *
 * @param props Project inventory and language.
 * @param props.index Active project inventory.
 * @param props.locale Requested document language.
 * @param props.onNavigate Optional mobile-dialog dismissal.
 * @returns Hierarchical project navigation.
 */
export function NavigationTree({
    index,
    locale,
    onNavigate,
}: {
    index: ProjectIndex;
    locale: string;
    onNavigate: ((this: void) => void) | undefined;
}): ReactElement {
    const root = navigationTree(index, locale);
    const children = [...root.children.values()].map(node => (
        <Branch key={node.route} node={node} onNavigate={onNavigate} />
    ));
    return (
        <ul className="my-3 list-none p-0 [&_ul]:mt-1 [&_ul]:ml-6 [&_ul]:list-none [&_ul]:p-0 [&_ul>li]:my-1 [&>li+li]:mt-2">
            <li>
                <NavLink to={root.route} end onClick={onNavigate} className={navigationLinkClasses}>
                    <span className="size-1.5 shrink-0 group-aria-[current=page]:bg-current" aria-hidden="true" />
                    <span>{root.title}</span>
                </NavLink>
            </li>
            {children}
        </ul>
    );
}
