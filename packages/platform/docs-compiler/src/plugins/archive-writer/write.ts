/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Archive } from "bun";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Repository } from "../../types/index.js";
import { encodeRepository } from "../../serialization/encode.js";


/**
 * Preserves a repository ID as its filename without allowing directories or traversal.
 *
 * @param id Repository ID used as the archive basename.
 * @returns The exact ID followed by .tar.gz.
 * @throws {TypeError} If the ID cannot safely identify a single output file.
 */
export function archiveFilename(id: string): string {
    if (
        id === "" ||
        id === "." ||
        id === ".." ||
        basename(id) !== id ||
        id.includes("/") ||
        id.includes("\\") ||
        id.includes("\0")
    ) {
        throw new TypeError(`Repository ID cannot be used as an archive filename: ${id}.`);
    }
    return `${id}.tgz`;
}

/**
 * Writes a repository through a temporary directory before replacing its final archive.
 * Temporary output is removed on success, cancellation, and failure.
 *
 * @param repository Completed repository whose ID defines the output filename.
 * @param outputDirectory Absolute configured output directory.
 * @param signal Compiler cancellation checked before publication of the completed archive.
 * @returns Completion of gzip TAR writing, atomic rename, and staging cleanup.
 * @rejects If encoding, compression, filesystem operations, or cleanup fail, or compilation is cancelled.
 */
export async function writeRepositoryArchive(
    repository: Repository,
    outputDirectory: string,
    signal: AbortSignal,
): Promise<void> {
    const filename = archiveFilename(repository.name.toLowerCase());
    const entries = await encodeRepository(repository, signal);
    await mkdir(outputDirectory, { recursive: true });
    const staging = await mkdtemp(join(outputDirectory, ".archive-"));
    await using cleanup = new AsyncDisposableStack();
    cleanup.defer(async () => {
        await rm(staging, { recursive: true, force: true });
    });
    const temporary = join(staging, filename);
    await Archive.write(temporary, entries, { compress: "gzip" });
    signal.throwIfAborted();
    await rename(temporary, join(outputDirectory, filename));
}
