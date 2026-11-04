/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Element, Root, RootContent } from "hast";


/**
 * Extracts readable text from HAST descendants.
 *
 * @param node The node value.
 * @returns The prepared result.
 */
export function nodeText(node: Root | Element | RootContent): string {
    if (node.type === "text") {
        return node.value;
    }
    if ("children" in node) {
        return node.children.map(nodeText).join("");
    }
    return "";
}
/**
 * Collects the heading anchors used by the contents navigation.
 *
 * @param tree The tree value.
 * @returns The prepared result.
 */
export function headings(tree: Root): { id: string; title: string; depth: number }[] {
    const result: { id: string; title: string; depth: number }[] = [];
    /**
     * Visits document elements without interpreting document-supplied code.
     *
     * @param node The node value.
     */
    function visit(node: Root | Element): void {
        for (const child of node.children) {
            if (child.type !== "element") {
                continue;
            }
            if (/^h[1-6]$/.test(child.tagName) && typeof child.properties.id === "string") {
                result.push({ id: child.properties.id, title: nodeText(child), depth: Number(child.tagName.slice(1)) });
            }
            visit(child);
        }
    }
    visit(tree);
    return result;
}
/**
 * Displays in-page links to compiled document headings.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.tree The tree input.
 * @param props.active The active input.
 */
export function Contents({ tree, active }: { tree: Root; active: string }): ReactElement {
    const baseHeading = 2;
    const indentations = ["pl-0", "pl-[10px]", "pl-5", "pl-[30px]", "pl-10"];
    const links = headings(tree).map(heading => (
        <li key={heading.id}>
            <a
                href={`#${heading.id}`}
                aria-current={active === heading.id ? "location" : undefined}
                className={`block border-l-2 border-transparent py-2 pl-2 text-(--gray-11) no-underline hover:text-(--gray-12) hover:underline aria-[current=location]:border-(--gray-11) aria-[current=location]:bg-(--gray-3) aria-[current=location]:font-medium aria-[current=location]:text-(--gray-12) ${indentations[Math.max(0, heading.depth - baseHeading)]}`}
            >
                {heading.title}
            </a>
        </li>
    ));
    return (
        <nav>
            <ul className="my-3 list-none p-0">{links}</ul>
        </nav>
    );
}
