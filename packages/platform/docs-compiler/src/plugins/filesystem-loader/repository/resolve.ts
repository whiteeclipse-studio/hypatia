/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { BigIntStats } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ArtifactReference, Input, Reference } from "../../../types";
import type { ResolvedFilesystemLoaderConfiguration } from "../configuration";
import { fileReference, type FilesystemRepository, isExcluded, isWithin } from "./index";


/**
 * Converts local paths and file URLs, delegating other URL protocols to other plugins.
 *
 * @param input Configured repository or child-file request.
 * @param base Directory used for relative paths.
 * @returns An absolute local path, or undefined for non-file URLs.
 * @throws {TypeError} If a file URL contains a query or fragment or cannot be converted.
 */
export function resolveInput(input: Input, base: string): string | undefined {
    if (typeof input === "string" && (isAbsolute(input) || !URL.canParse(input))) {
        return resolve(base, input);
    }

    const url = new URL(input);
    if (url.protocol !== "file:") {
        return undefined;
    }

    return fileURLToPath(url);
}

/**
 * Resolves a configured directory and reuses its source bookkeeping across builds.
 *
 * @param input Configured repository source.
 * @param configuration Resolved loader configuration.
 * @param repositories Filesystem repositories owned by this plugin instance.
 * @returns The repository, or undefined for another source kind.
 * @rejects If a local directory cannot be accessed.
 */
export async function resolveRepository(
    input: Input,
    configuration: ResolvedFilesystemLoaderConfiguration,
    repositories: Map<string, FilesystemRepository>,
): Promise<FilesystemRepository | undefined> {
    const path = resolveInput(input, configuration.cwd);
    if (path === undefined) {
        return undefined;
    }

    const directory = await realpath(path);
    if (!(await stat(directory)).isDirectory()) {
        return undefined;
    }

    const existing = repositories.get(directory);
    if (existing !== undefined) {
        return existing;
    }

    const repository: FilesystemRepository = {
        directory,
        reference: Object.freeze({ type: "repository", id: directory }),
        files: new Map(),
        sources: new Map(),
        translationDirectories: new Set(),
        expectedTranslations: new Map(),
    };

    repositories.set(directory, repository);
    return repository;
}

/**
 * Identifies the file version without rereading unchanged source bytes.
 *
 * @param information File identity, byte length, and nanosecond timestamps.
 * @returns A version token used to prevent reuse after a stat change.
 */
export function fileVersion(information: BigIntStats): string {
    return [information.dev, information.ino, information.size, information.mtimeNs, information.ctimeNs].join(":");
}

/**
 * Resolves a non-excluded regular file within an owned repository, skipping symbolic links.
 *
 * @param input Child-file request.
 * @param importer Requesting repository or artifact.
 * @param repository Owning filesystem repository.
 * @param configuration Resolved file-selection rules.
 * @returns A versioned artifact reference, or undefined for an unhandled path.
 * @rejects If an eligible file cannot be accessed.
 */
export async function resolveArtifact(
    input: Input,
    importer: Reference,
    repository: FilesystemRepository,
    configuration: ResolvedFilesystemLoaderConfiguration,
): Promise<ArtifactReference | undefined> {
    let base = repository.directory;
    if (importer.type === "artifact") {
        const source = repository.sources.get(importer.id.path);
        if (source === undefined) {
            return undefined;
        }
        base = dirname(source);
    }

    const file = resolveInput(input, base);
    if (file === undefined || !isWithin(repository.directory, file)) {
        return undefined;
    }

    const path = relative(repository.directory, file).split(sep).join("/");
    if (isExcluded(path, configuration) || (await realpath(file).catch(() => undefined)) !== file) {
        return undefined;
    }

    const information = await stat(file, { bigint: true });
    if (!information.isFile()) {
        return undefined;
    }

    const version = fileVersion(information);
    const reference = fileReference(repository, file);
    await rememberSource(repository, reference.id.path, file);
    repository.files.set(file, version);
    return { ...reference, version };
}

/**
 * Retains original physical spelling and rejects collisions with another existing source.
 * Missing old sources allow renames whose normalized logical identity stays the same.
 *
 * @param repository Loader-owned source mappings.
 * @param path Normalized artifact path.
 * @param file Canonical physical filename.
 * @returns Completion of source registration.
 * @rejects If another existing file has the same logical path or its status cannot be checked.
 */
async function rememberSource(repository: FilesystemRepository, path: string, file: string): Promise<void> {
    const previous = repository.sources.get(path);
    if (previous !== undefined && previous !== file) {
        try {
            await stat(previous);
            throw new Error(`Filesystem sources collide at logical path ${path}.`);
        } catch (error) {
            if (
                !(error instanceof Error) ||
                !("code" in error) ||
                (error.code !== "ENOENT" && error.code !== "ENOTDIR")
            ) {
                throw error;
            }
        }
    }
    repository.sources.set(path, file);
}
