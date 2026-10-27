/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { lstat, mkdir, realpath, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import type { DocumentationArtifact, ProcessingLimits } from "../types.ts";
import { requireCondition } from "../errors.ts";
import { packArtifact } from "../artifact/index.ts";
import { isMissingFile } from "./files.ts";

/** Output configuration makes the repository boundary explicit for writes. */
export interface WriteOptions {
    repositoryRoot?: string;
    limits?: Partial<ProcessingLimits>;
}

/**
 * Writes a complete validated TAR.GZ with an atomic same-directory replacement.
 *
 * @param artifact - In-memory artifact to serialize.
 * @param outputPath - Explicit archive destination ending in .tar.gz.
 * @param options - Repository boundary and optional resource limits.
 * @returns The canonical written path.
 * @rejects For unsafe destinations, serialization, or filesystem failures.
 */
export async function writeArtifact(
    artifact: DocumentationArtifact,
    outputPath: string,
    options: WriteOptions = {},
): Promise<string> {
    requireCondition(outputPath.endsWith(".tar.gz"), "Artifact output must end in .tar.gz", "output");
    const repository = await realpath(resolve(options.repositoryRoot ?? "."));
    const output = resolve(outputPath);
    requireCondition(!insideDocs(repository, output), "Output cannot reside inside docs", "unsafe-path");
    const bytes = await packArtifact(artifact, options.limits);
    const proposedDirectory = await resolvedDirectory(dirname(output));
    requireCondition(
        !insideDocs(repository, proposedDirectory),
        "Resolved output cannot reside inside docs",
        "unsafe-path",
    );
    await mkdir(proposedDirectory, { recursive: true });
    const directory = await realpath(proposedDirectory);
    const target = resolve(directory, basename(output));
    requireCondition(!insideDocs(repository, target), "Resolved output cannot reside inside docs", "unsafe-path");
    await rejectSymlink(target);
    const temporary = `${target}.${crypto.randomUUID()}.tmp`;
    try {
        await writeFile(temporary, bytes, { flag: "wx" });
        await rename(temporary, target);
    } finally {
        await removeTemporary(temporary);
    }
    return target;
}

/**
 * Resolves existing symlink ancestors before creating any output directories.
 *
 * @param directory - Requested output directory, which may not exist yet.
 * @returns The proposed canonical output directory.
 * @rejects For filesystem failures other than missing descendants.
 */
async function resolvedDirectory(directory: string): Promise<string> {
    try {
        return await realpath(directory);
    } catch (error) {
        if (!isMissingFile(error) || dirname(directory) === directory) {
            throw error;
        }
        return resolve(await resolvedDirectory(dirname(directory)), basename(directory));
    }
}

/**
 * Checks whether a destination aliases the repository docs directory.
 *
 * @param repository - Canonical repository root.
 * @param path - Candidate absolute destination.
 * @returns Whether the destination is within docs.
 */
function insideDocs(repository: string, path: string): boolean {
    const docs = resolve(repository, "docs");
    return path === docs || path.startsWith(`${docs}/`);
}

/**
 * Prevents output replacement from concealing a symlink configuration mistake.
 *
 * @param path - Explicit output filename.
 * @returns Completion after checking the destination.
 * @rejects For existing symlinks or filesystem failures other than absence.
 */
async function rejectSymlink(path: string): Promise<void> {
    try {
        requireCondition(!(await lstat(path)).isSymbolicLink(), "Output cannot be a symlink", "unsafe-path");
    } catch (error) {
        if (!isMissingFile(error)) {
            throw error;
        }
    }
}

/**
 * Removes a staged file without hiding a real cleanup failure.
 *
 * @param path - Temporary sibling path.
 * @returns Completion after cleanup.
 * @rejects For cleanup failures other than an already-absent file.
 */
async function removeTemporary(path: string): Promise<void> {
    try {
        await unlink(path);
    } catch (error) {
        if (!isMissingFile(error)) {
            throw error;
        }
    }
}
