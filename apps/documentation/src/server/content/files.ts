/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readdir, readFile, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";

/** Processing limits for this local exploratory converter; checked between filesystem operations. */
export const contentLimits = {
    files: 2000,
    markdownBytes: 1_048_576,
    assetBytes: 8_388_608,
    totalBytes: 67_108_864,
    milliseconds: 30_000,
};

const assetExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico"]);

/** Files eligible for rendering or publication, relative to the configured docs root. */
export interface ContentFiles {
    markdown: string[];
    assets: string[];
}

/**
 * Checks whether a path belongs to the docs tree without reading an outside target.
 *
 * @param path - Path relative to the documentation root.
 * @returns Whether the path remains within that root.
 */
export function isWithinDocs(path: string): boolean {
    return (
        path !== ".." &&
        !path.startsWith("../") &&
        !path.startsWith("..\\") &&
        !isAbsolute(path) &&
        !path.includes("\0")
    );
}

/**
 * Reads an existing, contained source file with a per-file size limit.
 *
 * @param root - Configured documentation root.
 * @param path - Relative source path.
 * @param maximum - Allowed file size in bytes.
 * @returns The source bytes.
 * @rejects If the path escapes docs, is unavailable, or exceeds the limit.
 */
export async function readContentFile(root: string, path: string, maximum: number): Promise<Buffer> {
    const directory = await realpath(root);
    const file = await realpath(resolve(directory, path));
    if (!isWithinDocs(relative(directory, file))) {
        throw new Error(`Content path escapes the docs tree: ${path}`);
    }
    const information = await stat(file);
    if (!information.isFile() || information.size > maximum) {
        throw new Error(`Content file is not a regular file within the size limit: ${path}`);
    }
    const bytes = await readFile(file);
    if (bytes.byteLength > maximum) {
        throw new Error(`Content file exceeds the size limit: ${path}`);
    }
    return bytes;
}

/**
 * Enumerates Markdown and image assets, excluding AGENTS.md at every depth and rejecting symlinks.
 * No URLs, repository scripts, outside targets, or document-supplied configuration are loaded.
 *
 * @param root - Application-configured local docs directory.
 * @returns Deterministically ordered eligible source paths.
 * @rejects If traversal fails, a symlink is found, or the processing budget is exceeded.
 */
export async function discoverContent(root: string): Promise<ContentFiles> {
    const result: ContentFiles = { markdown: [], assets: [] };
    const deadline = Date.now() + contentLimits.milliseconds;
    let count = 0;
    let bytes = 0;

    /**
     * Accounts for one eligible file and checks its source size before parsing or copying.
     *
     * @param path - Relative source path.
     * @returns Completion after the file has been classified.
     * @rejects If inspection fails or a source size limit is exceeded.
     */
    async function addFile(path: string): Promise<void> {
        const extension = extname(path);
        if (extension !== ".md" && !assetExtensions.has(extension.toLowerCase())) {
            return;
        }
        const information = await stat(resolve(root, path));
        bytes += information.size;
        const maximum = extension === ".md" ? contentLimits.markdownBytes : contentLimits.assetBytes;
        if (information.size > maximum || bytes > contentLimits.totalBytes) {
            throw new Error(`Documentation size limit exceeded: ${path}`);
        }
        if (extension === ".md") {
            result.markdown.push(path);
        } else if (path.split("/").includes("assets")) {
            result.assets.push(path);
        }
    }

    /**
     * Visits one directory without following symbolic links.
     *
     * @param directory - Directory path relative to docs.
     * @returns Completion after eligible descendants are collected.
     * @rejects If a file is unsafe, unavailable, or outside the processing budget.
     */
    async function walk(directory: string): Promise<void> {
        const entries = await readdir(resolve(root, directory), { withFileTypes: true });
        entries.sort((left, right) => left.name.localeCompare(right.name, "en"));
        for (const entry of entries) {
            if (entry.name === "AGENTS.md") {
                continue;
            }
            const path = directory === "" ? entry.name : `${directory}/${entry.name}`;
            count += 1;
            if (count > contentLimits.files || Date.now() > deadline) {
                throw new Error("Documentation discovery exceeded its file or time limit.");
            }
            if (entry.isSymbolicLink()) {
                throw new Error(`Documentation symlinks are not supported: ${path}`);
            }
            if (entry.isDirectory()) {
                await walk(path);
                continue;
            }
            await addFile(path);
        }
    }

    await walk("");
    return result;
}
