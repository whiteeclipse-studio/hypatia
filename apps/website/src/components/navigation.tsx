/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useState, type ReactElement } from "react";
import { IconButton } from "@radix-ui/themes";
import type { DocumentationManifest, NavigationEntry } from "@whiteeclipse/documentation-builder/artifact";
import { pageUrl } from "../routes.ts";

/** Inputs for the manifest-driven navigation tree. */
interface NavigationProps {
    manifest: DocumentationManifest;
    activeId: string;
}

/** Inputs for a folder or page navigation row. */
interface EntryProps extends NavigationProps {
    entry: NavigationEntry;
}

/**
 * Opens ancestors of the active page on initial rendering.
 *
 * @param entry - Candidate navigation subtree.
 * @param id - Active page ID.
 * @returns Whether this subtree contains the active document.
 */
function containsPage(entry: NavigationEntry, id: string): boolean {
    return (
        entry.pageId === id ||
        entry.children.some(function contains(child): boolean {
            return containsPage(child, id);
        })
    );
}

/**
 * Keeps folder expansion separate from index-page navigation.
 *
 * @param props - Manifest entry and active document.
 * @param props.entry - Navigation subtree.
 * @param props.manifest - Validated project manifest.
 * @param props.activeId - Current document ID.
 * @returns A navigation row with optional collapsible descendants.
 */
function NavigationItem({ entry, manifest, activeId }: EntryProps): ReactElement | null {
    const [expanded, setExpanded] = useState(containsPage(entry, activeId));
    const page = manifest.pages.find(function matching(candidate): boolean {
        return candidate.id === entry.pageId;
    });
    if (page === undefined) {
        return null;
    }
    const children = entry.children.map(function child(item) {
        return <NavigationItem key={item.pageId} entry={item} manifest={manifest} activeId={activeId} />;
    });
    /** Toggles descendants without changing the current document. */
    function toggle(): void {
        setExpanded(!expanded);
    }
    const listId = `navigation-${entry.pageId}`;
    return (
        <li>
            <div className="flex items-center gap-(--space-2) py-(--space-1)">
                {children.length > 0 ? (
                    <IconButton
                        size="1"
                        variant="ghost"
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${entry.title}`}
                        aria-expanded={expanded}
                        aria-controls={listId}
                        onClick={toggle}
                    >
                        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                    </IconButton>
                ) : (
                    <span className="w-6 shrink-0 text-center text-muted" aria-hidden="true">
                        ·
                    </span>
                )}
                <a
                    href={pageUrl(manifest.source.name, page.path)}
                    aria-current={activeId === page.id ? "page" : undefined}
                    className="min-w-0 flex-1 p-(--space-2) text-label leading-[1.4] wrap-anywhere no-underline hover:bg-hover aria-[current=page]:bg-ink aria-[current=page]:text-surface aria-[current=page]:hover:bg-ink"
                >
                    {entry.title}
                </a>
            </div>
            {children.length > 0 && (
                <ul
                    id={listId}
                    hidden={!expanded}
                    className="m-0 ml-(--space-2) list-none border-l border-line p-0 pl-(--space-4)"
                >
                    {children}
                </ul>
            )}
        </li>
    );
}

/**
 * Renders the builder's tree, which already omits duplicate READMEs and AGENTS pages.
 *
 * @param props - Current manifest and page.
 * @param props.manifest - Validated project manifest.
 * @param props.activeId - Current document ID.
 * @returns Hierarchical document navigation.
 */
export function Navigation({ manifest, activeId }: NavigationProps): ReactElement {
    const entries = manifest.navigation.map(function item(entry) {
        return <NavigationItem key={entry.pageId} entry={entry} manifest={manifest} activeId={activeId} />;
    });
    return (
        <nav aria-label="Documentation">
            <ul className="m-0 list-none p-0">{entries}</ul>
        </nav>
    );
}
