/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ProjectIndex } from "./types";
import { directoryTitle } from "./directory-title";
import { projectHome, translatedEntry } from "./routes";


/** One documentation ancestor or the current page. */
export interface Breadcrumb {
    route: string;
    title: string;
}

/**
 * Resolves each path segment from the documentation root to the current page.
 *
 * @param index The project's canonical and translated entries.
 * @param route The normalized current route.
 * @param locale The selected document language.
 * @param currentTitle The loaded current page's localized title, if available.
 * @returns Ordered ancestors, including synthesized directory routes.
 */
export function breadcrumbs(index: ProjectIndex, route: string, locale: string, currentTitle?: string): Breadcrumb[] {
    const home = projectHome(index.project.id);
    // Authored links may still lead to repository documents outside docs/.
    const root = route.startsWith(home) ? home : `/${index.project.id}/`;
    const result: Breadcrumb[] = [{ route: root, title: index.project.name }];
    let parent = root;
    for (const segment of route.slice(root.length).split("/").filter(Boolean)) {
        parent += `${segment}/`;
        const ancestorRoute = parent;
        const entry =
            index.entries.find(item => item.route === ancestorRoute && item.locale === "en") ??
            index.entries.find(item => item.route === ancestorRoute);
        let title = entry === undefined ? directoryTitle(segment) : translatedEntry(index, entry, locale).title;
        if (parent === route && currentTitle !== undefined) {
            title = currentTitle;
        }
        result.push({ route: parent, title });
    }
    return result;
}
