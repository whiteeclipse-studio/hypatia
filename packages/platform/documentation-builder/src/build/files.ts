/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { constants } from "node:fs";
import { lstat, open, readdir, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { archivePath } from "../paths.ts";
import { requireCondition } from "../errors.ts";
import type { ProcessingLimits, SourceFile } from "../types.ts";

/** Source collection includes watcher dependencies and the optional root licence form. */
export interface DiscoveredSources {
    files: SourceFile[];
    dependencies: string[];
    licence: "none" | "markdown" | "text";
    totalBytes: number;
}

/**
 * Checks a resolved path remains within a configured root.
 *
 * @param root - Configured canonical directory.
 * @param path - Candidate absolute path.
 * @throws {DocumentationError} For paths outside the configured directory.
 */
export function requireWithin(root: string, path: string): void {
    const local = relative(root, path);
    requireCondition(
        !isAbsolute(local) && local !== ".." && !local.startsWith("../"),
        `Path leaves configured directory: ${path}`,
        "unsafe-path",
    );
}

/**
 * Discovers docs and the explicit root licence exception, rejecting symlinked input.
 *
 * @param root - Canonical repository root.
 * @param limits - Resolved size and count ceilings.
 * @returns Source files, watched paths, and selected licence format.
 * @rejects For missing docs, unsafe paths, unsupported filesystem entries, or resource failures.
 */
export async function discoverSources(root: string, limits: ProcessingLimits): Promise<DiscoveredSources> {
    const docs = resolve(root, "docs");
    requireCondition((await lstat(docs)).isDirectory(), "docs must be a real directory", "unsafe-path");
    const result: DiscoveredSources = { files: [], dependencies: [docs], licence: "none", totalBytes: 0 };
    await walkDirectory(docs, docs, result, limits);
    await addLicence(root, result, limits);
    return result;
}

/**
 * Walks real directories without following symlinks or copying editor metadata.
 *
 * @param root - Canonical docs root.
 * @param directory - Current directory.
 * @param result - Accumulating sources and dependency paths.
 * @param limits - Resolved resource ceilings.
 * @returns Completion after discovery of the current directory.
 * @rejects For unsafe entries or filesystem failures.
 */
async function walkDirectory(
    root: string,
    directory: string,
    result: DiscoveredSources,
    limits: ProcessingLimits,
): Promise<void> {
    requireWithin(root, await realpath(directory));
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.name === ".DS_Store") {
            continue;
        }
        const path = resolve(directory, entry.name);
        requireCondition(!entry.isSymbolicLink(), `Source symlinks are unsupported: ${path}`, "unsafe-path");
        if (entry.isDirectory()) {
            await walkDirectory(root, path, result, limits);
        } else {
            requireCondition(entry.isFile(), `Unsupported source filesystem entry: ${path}`, "unsafe-path");
            const content = await readBoundedFile(root, path, limits.maxFileBytes);
            addSourceFile(result, { path: archivePath(relative(root, path)), content }, limits);
            result.dependencies.push(path);
        }
    }
}

/**
 * Reads an ordinary file with a no-follow file handle and checks its canonical location.
 *
 * @param root - Allowed canonical read root.
 * @param path - Candidate file.
 * @param maximum - Maximum file size.
 * @returns Complete file bytes.
 * @rejects For symlinks, escaping paths, oversized files, or filesystem failures.
 */
export async function readBoundedFile(root: string, path: string, maximum: number): Promise<Uint8Array> {
    requireWithin(root, await realpath(path));
    const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
        const stat = await handle.stat();
        requireCondition(stat.isFile() && stat.size <= maximum, `Not an ordinary bounded file: ${path}`, "limits");
        const content = await handle.readFile();
        requireCondition(content.byteLength <= maximum, `File grew beyond its limit: ${path}`, "limits");
        return new Uint8Array(content);
    } finally {
        await handle.close();
    }
}

/**
 * Adds LICENCE.md preferentially, or wraps plain LICENCE as a virtual Markdown source.
 *
 * @param root - Canonical repository root.
 * @param result - Discovered source collection.
 * @param limits - Resolved processing ceilings.
 * @returns Completion after the optional licence has been selected.
 * @rejects For source collisions, symlinks, or filesystem failures.
 */
async function addLicence(root: string, result: DiscoveredSources, limits: ProcessingLimits): Promise<void> {
    for (const name of ["LICENCE.md", "LICENCE"]) {
        const path = resolve(root, name);
        try {
            const content = await readBoundedFile(root, path, limits.maxFileBytes);
            requireCondition(
                !result.files.some(function collision(file): boolean {
                    return file.path === "LICENCE.md";
                }),
                "Root licence collides with docs/LICENCE.md",
                "collision",
            );
            addSourceFile(result, { path: "LICENCE.md", content }, limits);
            result.dependencies.push(path);
            // eslint-disable-next-line no-param-reassign -- the discovery accumulator records the selected licence form.
            result.licence = name === "LICENCE.md" ? "markdown" : "text";
            return;
        } catch (error) {
            if (!isMissingFile(error)) {
                throw error;
            }
        }
    }
}

/**
 * Recognizes absent optional files without hiding permission or validation failures.
 *
 * @param error - Original filesystem failure.
 * @returns Whether the filesystem reports a missing path.
 */
export function isMissingFile(error: unknown): boolean {
    return error instanceof Error && "code" in error && error.code === "ENOENT";
}

/**
 * Accounts for source size as files are read, before retaining an oversized tree.
 *
 * @param result - Discovery accumulator.
 * @param file - New bounded source file.
 * @param limits - Resolved count and expanded-size ceilings.
 * @throws {DocumentationError} When retaining this file would exceed the source budget.
 */
function addSourceFile(result: DiscoveredSources, file: SourceFile, limits: ProcessingLimits): void {
    const total = result.totalBytes + file.content.byteLength;
    requireCondition(
        result.files.length < limits.maxFiles && total <= limits.maxExpandedBytes,
        "Source collection exceeds resource limits",
        "limits",
    );
    // eslint-disable-next-line no-param-reassign -- update the discovery budget before retaining a new file.
    result.totalBytes = total;
    result.files.push(file);
}
