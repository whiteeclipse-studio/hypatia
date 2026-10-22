/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { contentLimits, isWithinDocs } from "../content/files";
import { git } from "./git";

/** Non-executable tracked file from one pinned Git tree. */
interface TrackedFile {
    path: string;
    object: string;
    size: number;
}

/**
 * Parses Git's NUL-delimited tree entry, rejecting non-regular files and excluding agent instructions.
 *
 * @param entry - One tree record with mode, object, size, and raw path.
 * @returns Regular file metadata, or undefined for excluded instructions.
 * @throws {Error} If an entry cannot safely be materialized.
 */
function parseFile(entry: string): TrackedFile | undefined {
    const match = /^(?<mode>\d+) blob (?<object>[a-f0-9]+)\s+(?<size>\d+)\t(?<path>[^\0]+)$/s.exec(entry);
    const fields = match?.groups;
    if (fields?.["path"]?.split("/").includes("AGENTS.md") === true) {
        return undefined;
    }
    if (fields === undefined || !["100644", "100755"].includes(fields["mode"] ?? "")) {
        throw new Error(`Unsupported Git entry in documentation source: ${entry}`);
    }
    return { path: fields["path"] ?? "", object: fields["object"] ?? "", size: Number(fields["size"]) };
}

/**
 * Lists regular tracked files without checking out attributes, hooks, symlinks, or submodules.
 *
 * @param database - Cached bare Git object database.
 * @param commit - Full immutable commit hash.
 * @param path - Explicit repository-relative subtree or file.
 * @returns Bounded file metadata.
 * @rejects If the tree contains unsupported entries or exceeds import limits.
 */
async function listFiles(database: string, commit: string, path: string): Promise<TrackedFile[]> {
    const bytes = await git(["--git-dir", database, "ls-tree", "-r", "-l", "-z", commit, "--", path]);
    const files: TrackedFile[] = [];
    let total = 0;
    for (const entry of bytes.toString("utf8").split("\0").filter(Boolean)) {
        const file = parseFile(entry);
        if (file === undefined) {
            continue;
        }
        total += file.size;
        if (
            !isWithinDocs(file.path) ||
            file.path.includes("\\") ||
            file.size > contentLimits.assetBytes ||
            total > contentLimits.totalBytes ||
            files.length >= contentLimits.files
        ) {
            throw new Error(`Repository import limit or path violation: ${file.path}`);
        }
        files.push(file);
    }
    return files;
}

/**
 * Reads one explicitly requested source file from a commit, without following outside or executable targets.
 *
 * @param database - Cached bare object database.
 * @param commit - Pinned source commit.
 * @param path - Repository-relative regular file.
 * @returns The file's bounded raw bytes.
 * @rejects If the path is unsafe, unavailable, not regular, or too large.
 */
export async function readSnapshotFile(database: string, commit: string, path: string): Promise<Buffer> {
    if (!isWithinDocs(path) || path === "" || path.includes("\\") || path.split("/").includes("AGENTS.md")) {
        throw new Error(`Invalid repository source path: ${path}`);
    }
    const files = await listFiles(database, commit, path);
    const file = files.find(entry => entry.path === path);
    if (file === undefined) {
        throw new Error(`Missing regular repository source file: ${path}`);
    }
    return git(["--git-dir", database, "cat-file", "blob", file.object], contentLimits.assetBytes);
}

/**
 * Materializes only docs into a fresh staging directory, excluding AGENTS.md before reading its contents.
 *
 * @param database - Cached object database.
 * @param commit - Pinned source commit.
 * @param docsRoot - Empty destination controlled by the application.
 * @returns Completion after the complete docs snapshot is available.
 * @rejects If files are unsafe, missing, oversized, or the import exceeds its time limit.
 */
export async function extractDocumentation(database: string, commit: string, docsRoot: string): Promise<void> {
    const files = await listFiles(database, commit, "docs");
    const deadline = Date.now() + contentLimits.milliseconds;
    if (files.length === 0) {
        throw new Error("The configured repository has no tracked docs tree.");
    }
    await mkdir(docsRoot, { recursive: true });
    for (const file of files) {
        if (!file.path.startsWith("docs/") || Date.now() > deadline) {
            throw new Error("Invalid docs tree or repository extraction exceeded its time limit.");
        }
        const output = resolve(docsRoot, file.path.slice("docs/".length));
        const bytes = await git(["--git-dir", database, "cat-file", "blob", file.object], contentLimits.assetBytes);
        await mkdir(dirname(output), { recursive: true });
        await writeFile(output, bytes, { flag: "wx" });
    }
}
