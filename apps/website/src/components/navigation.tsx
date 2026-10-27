/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useState, type ReactElement } from "react";
import { IconButton } from "@radix-ui/themes";
import type { DocumentationManifest, NavigationEntry } from "@whiteeclipse/documentation-builder/artifact";
import { pageUrl } from "../routes.ts";

const treeClassName = "m-0 list-none p-0 text-[13px] leading-[1.5] [&_li]:my-[8px]";
const folderClassName = [
    "relative text-ink transition-colors duration-160 ease-out motion-reduce:transition-none",
    "hover:bg-ink hover:text-surface focus-within:bg-ink focus-within:text-surface",
    "data-[current=true]:bg-ink data-[current=true]:text-surface",
].join(" ");
const pageClassName = [
    "relative block border border-transparent py-[8px] pr-[6px] pl-[32px] text-[12px] font-normal wrap-anywhere text-muted no-underline",
    "before:pointer-events-none before:absolute before:top-1/2 before:left-[12px] before:size-[6px] before:-translate-y-1/2 before:bg-current before:opacity-0 before:content-['']",
    "hover:border-current hover:bg-ink hover:text-surface hover:before:opacity-100",
    "focus-visible:border-current focus-visible:bg-ink focus-visible:text-surface focus-visible:before:opacity-100",
    "aria-[current=page]:border-current aria-[current=page]:bg-ink aria-[current=page]:text-surface aria-[current=page]:before:opacity-100",
].join(" ");

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
    const [expanded, setExpanded] = useState(
        containsPage(entry, activeId) || (activeId === "" && manifest.navigation.includes(entry)),
    );
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
    const folder = page.path.split("/").pop() === "index.html";
    return (
        <li>
            <div data-current={activeId === page.id} className={folder ? folderClassName : undefined}>
                {children.length > 0 && (
                    <IconButton
                        size="1"
                        variant="outline"
                        className="group/navigation-toggle absolute top-1/2 left-1 m-0 size-6 -translate-y-1/2 border-0 bg-transparent bg-none p-1 text-inherit shadow-none"
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${entry.title}`}
                        aria-expanded={expanded}
                        aria-controls={listId}
                        onClick={toggle}
                    >
                        <span
                            aria-hidden="true"
                            className="navigation-disclosure pointer-events-none inline-block size-4 shrink-0 box-border p-px transition-[background-size] duration-180 ease-out group-hover/navigation-toggle:[--disclosure-corner:50%] group-focus-visible/navigation-toggle:[--disclosure-corner:50%] group-aria-expanded/navigation-toggle:[--disclosure-vertical:linear-gradient(transparent,transparent)] motion-reduce:transition-none"
                        />
                    </IconButton>
                )}
                <a
                    href={pageUrl(manifest.source.name, page.path)}
                    aria-current={activeId === page.id ? "page" : undefined}
                    className={
                        folder
                            ? "block py-2 pr-2 pl-8 text-[13px] font-medium wrap-anywhere text-inherit no-underline"
                            : pageClassName
                    }
                >
                    {entry.title}
                </a>
            </div>
            {children.length > 0 && (
                <ul id={listId} hidden={!expanded} className={`${treeClassName} ml-4`}>
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
            <ul className={treeClassName}>
                <li>
                    <a href="/" className={pageClassName} aria-current={activeId === "" ? "page" : undefined}>
                        Overview
                    </a>
                </li>
                {entries}
            </ul>
        </nav>
    );
}
