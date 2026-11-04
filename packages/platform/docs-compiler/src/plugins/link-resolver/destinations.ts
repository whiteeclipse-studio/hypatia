/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Properties, Root } from "hast";
import { visit } from "unist-util-visit";
import type { TransformHookContext } from "../../types";


/** Local path separated from the verbatim query and fragment suffix. */
interface Destination {
    readonly path: string;
    readonly suffix: string;
}

/**
 * Selects relative source destinations without interpreting external or website-root URLs.
 *
 * @param destination Authored URL.
 * @returns A decoded path and untouched suffix, or undefined for non-local destinations.
 * @throws {URIError} If URL encoding in a local path is malformed.
 */
function localDestination(destination: string): Destination | undefined {
    const url = destination.trim();
    if (/^(?:[a-z][a-z0-9+.-]*:|[/\\?#])/i.test(url) || url === "") {
        return undefined;
    }
    const end = url.search(/[?#]/);
    const path = end < 0 ? url : url.slice(0, end);
    const decoded = decodeURIComponent(path);
    if (
        decoded.includes("\0") ||
        decoded.includes("\\") ||
        decoded.startsWith("/") ||
        /^[a-z][a-z0-9+.-]*:/i.test(decoded)
    ) {
        throw new URIError(`Invalid relative link path: ${path}.`);
    }
    return { path: decoded, suffix: end < 0 ? "" : url.slice(end) };
}

/**
 * Creates a source-local destination resolver, sharing repeated targets across all its HAST roots.
 *
 * @param context Borrowed transform services bound to the importing source.
 * @returns An asynchronous destination mapper.
 * @rejects If destination mapping, resolution, or inclusion fails.
 */
export function createDestinationResolver(context: TransformHookContext): (destination: string) => Promise<string> {
    const targets = new Map<string, Promise<string | undefined>>();

    /**
     * Resolves and includes a target without awaiting its transforms or reading its contents.
     *
     * @param path Decoded relative source path.
     * @returns Logical target path, or undefined when resolution delegates.
     * @rejects If source resolution or inclusion fails.
     */
    async function resolve(path: string): Promise<string | undefined> {
        const target = await context.resolve(path);
        context.signal.throwIfAborted();
        if (target === undefined) {
            context.logger.warning("Unresolved source link: {path}.", { path });
            return undefined;
        }
        if (target.type !== "artifact") {
            throw new TypeError(`Expected an artifact target for link ${path}.`);
        }
        context.include(target);
        return target.id.path;
    }

    return async destination => {
        context.signal.throwIfAborted();
        const local = localDestination(destination);
        if (local === undefined) {
            return destination;
        }
        let target = targets.get(local.path);
        if (target === undefined) {
            target = resolve(local.path);
            targets.set(local.path, target);
        }
        const path = await target;
        return path === undefined ? destination : path + local.suffix;
    };
}

/**
 * Rewrites resource and anchor destinations on an independently owned HAST root.
 *
 * @param tree Article or formatted metadata root.
 * @param resolve Source-local destination mapper.
 * @returns Completion of all rewrites.
 * @rejects If destination mapping fails.
 */
export async function resolveTree(tree: Root, resolve: (destination: string) => Promise<string>): Promise<void> {
    const replacements: { properties: Properties; property: string; value: string }[] = [];
    visit(tree, "element", node => {
        for (const property of ["href", "src", "poster", "cite"]) {
            const value = node.properties[property];
            if (typeof value === "string") {
                replacements.push({ properties: node.properties, property, value });
            }
        }
    });
    for (const replacement of replacements) {
        replacement.properties[replacement.property] = await resolve(replacement.value);
    }
}
