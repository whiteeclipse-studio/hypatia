/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** A navigable page or a source directory in the documentation sidebar. */
export type NavigationEntry =
    | { kind: "page"; label: string; href: string; current?: boolean }
    | { kind: "directory"; label: string; entries: readonly NavigationEntry[]; expanded?: boolean };

import type { DocumentSummary } from "../../content/types";
import { documentVariants, selectTranslation } from "../../content/localization";

/**
 * Builds the source hierarchy using translated titles and English fallbacks without duplicating translation directories.
 *
 * @param documents - Validated publication index.
 * @param language - Current interface locale.
 * @param route - Current page, used for active links and expanded ancestor directories.
 * @returns A directory tree containing a link for every English document and its selected translation.
 */
export function createNavigation(
    documents: readonly DocumentSummary[],
    language: string,
    route: string,
): NavigationEntry[] {
    const paths = documents.filter(document => document.language === "en").map(document => document.canonicalPath);
    const activeDocument = documents.find(document => document.route === route);
    const activePath = activeDocument?.canonicalPath;

    /**
     * Groups the immediate descendants of one source directory.
     *
     * @param prefix - Directory path relative to docs, including its trailing separator.
     * @returns Navigable files and directories at this level.
     */
    function entriesAt(prefix: string): NavigationEntry[] {
        const names = [
            ...new Set(
                paths
                    .filter(path => path.startsWith(prefix))
                    .map(path => path.slice(prefix.length).split("/")[0] ?? ""),
            ),
        ];
        names.sort((left, right) => {
            const leftIsFile = paths.includes(`${prefix}${left}`);
            const rightIsFile = paths.includes(`${prefix}${right}`);
            if (leftIsFile !== rightIsFile) {
                return Number(rightIsFile) - Number(leftIsFile);
            }
            return left.localeCompare(right, "en");
        });
        const entries: NavigationEntry[] = [];
        for (const name of names) {
            const path = `${prefix}${name}`;
            const document =
                activeDocument?.canonicalPath === path
                    ? activeDocument
                    : selectTranslation(documentVariants(documents, path, documents[0]?.repository ?? ""), language);
            if (document === undefined) {
                entries.push({
                    kind: "directory",
                    label: name,
                    entries: entriesAt(`${path}/`),
                    expanded: prefix === "" || activePath?.startsWith(`${path}/`) === true,
                });
            } else {
                entries.push({
                    kind: "page",
                    label: document.title,
                    href: document.route,
                    current: document.route === route,
                });
            }
        }
        return entries;
    }

    return entriesAt("");
}
