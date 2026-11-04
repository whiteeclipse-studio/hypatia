/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ProjectIndex } from "./types";
import { directoryTitle } from "./directory-title";
import { translatedEntry } from "./routes";


/** One immediate document or folder in a generated directory index. */
export interface DirectoryChild {
    route: string;
    title: string;
}

/**
 * Groups navigable descendants into unique immediate children.
 *
 * @param index Project inventory, including localized document labels.
 * @param route Current folder route with a trailing slash.
 * @param locale Selected document language.
 * @returns Direct documents and folders, including folders without a README.
 */
export function directoryChildren(index: ProjectIndex, route: string, locale: string): DirectoryChild[] {
    const routes = new Set<string>();
    for (const entry of index.entries) {
        if (!entry.navigable || !entry.route.startsWith(route) || entry.route === route) {
            continue;
        }
        const segment = entry.route.slice(route.length).split("/")[0];
        if (segment !== undefined && segment !== "") {
            routes.add(`${route}${segment}/`);
        }
    }
    return [...routes].map(childRoute => {
        const entry = index.entries.find(item => item.navigable && item.route === childRoute);
        return {
            route: childRoute,
            title:
                entry === undefined
                    ? directoryTitle(childRoute.slice(route.length).replace(/\/$/, ""))
                    : translatedEntry(index, entry, locale).title,
        };
    });
}
