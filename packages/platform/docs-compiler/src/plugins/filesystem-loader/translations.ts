/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readdir, realpath } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import type {
    ArtifactReference,
    CompilationResult,
    Input,
    Repository,
    RepositoryReference,
    TransformHookContext,
} from "../../types";
import type { ResolvedFilesystemLoaderConfiguration } from "./configuration";
import { type FilesystemRepository, isExcluded, isWithin } from "./repository";


/**
 * Identifies a discovery catalogue independently of file content versions.
 *
 * @param repository Owning filesystem source.
 * @returns A repository-shaped watch-only dependency; it is never included or loaded.
 */
export function translationsCatalogue(repository: FilesystemRepository): RepositoryReference {
    return {
        type: "repository",
        id: JSON.stringify(["filesystem-translations", repository.directory]),
    };
}

/**
 * Finds the standard mirrored directory from the original source spelling, not its logical path.
 *
 * @param source Canonical source filename.
 * @param repository Canonical repository directory and source map.
 * @returns Directory and basename for translations, or undefined outside canonical docs Markdown.
 */
function translationLocation(
    source: string,
    repository: FilesystemRepository,
): { directory: string; stem: string } | undefined {
    const docs = resolve(repository.directory, "docs");
    const translations = resolve(docs, "translations");
    if (!isWithin(docs, source) || isWithin(translations, source) || !source.toLowerCase().endsWith(".md")) {
        return undefined;
    }

    const path = relative(docs, source);
    const filename = basename(path);

    return {
        directory: resolve(translations, dirname(path)),
        stem: filename.slice(0, -".md".length),
    };
}

/**
 * Reads a real directory, treating a missing translation directory as an empty catalogue.
 *
 * @param directory Expected physical directory without symbolic segments.
 * @returns Regular-file entries; symbolic directories and missing directories yield no candidates.
 * @rejects If access fails for a reason other than a missing path.
 */
async function translationFiles(directory: string) {
    try {
        if ((await realpath(directory)) !== directory) {
            return [];
        }
        return await readdir(directory, { withFileTypes: true });
    } catch (error) {
        if (error instanceof Error && "code" in error && (error.code === "ENOENT" || error.code === "ENOTDIR")) {
            return [];
        }
        throw error;
    }
}

/**
 * Enumerates non-excluded translations under docs/translations using the source's physical path.
 *
 * @param location Mirrored physical directory and source basename.
 * @param location.directory Physical translation directory.
 * @param location.stem Canonical filename without its Markdown extension.
 * @param repository Loader-owned original source locations.
 * @param configuration Explicit source exclusions.
 * @param context Borrowed transform services, including watch dependency tracking.
 * @returns Absolute source URLs to resolve through the normal plugin chain.
 * @rejects If directory access, watch registration, or cancellation fails.
 */
async function discoverFilesystemTranslations(
    location: { directory: string; stem: string },
    repository: FilesystemRepository,
    configuration: ResolvedFilesystemLoaderConfiguration,
    context: TransformHookContext,
): Promise<readonly Input[]> {
    // The existing repository watcher supplies notifications for this discovery-only dependency.
    repository.translationDirectories.add(location.directory);
    await context.watch(translationsCatalogue(repository), () => () => {
        /* No additional watcher is owned here. */
    });

    const candidates: Input[] = [];
    for (const entry of await translationFiles(location.directory)) {
        context.signal.throwIfAborted();
        const name = entry.name;
        const locale = name.slice(location.stem.length + 1, -".md".length);
        if (
            !entry.isFile() ||
            !name.startsWith(`${location.stem}.`) ||
            !name.toLowerCase().endsWith(".md") ||
            locale === "" ||
            locale.includes(".")
        ) {
            continue;
        }

        const file = resolve(location.directory, name);
        const path = relative(repository.directory, file).split(sep).join("/");
        if (!isExcluded(path, configuration)) {
            candidates.push(pathToFileURL(file));
        }
    }

    return candidates.sort((left, right) => String(left).localeCompare(String(right)));
}

/**
 * Queues translations after parsing, using only filesystem-loader-owned discovery state.
 *
 * @param value Source representation after preceding transforms.
 * @param reference Source identity within this filesystem repository.
 * @param services Loader-owned source locations and exclusions.
 * @param services.repository Owning filesystem source.
 * @param services.configuration Captured loader options.
 * @param context Borrowed transform services bound to the importing source.
 * @returns Completion of discovery and queued inclusion.
 * @rejects If parsing order, resolution, source association, or inclusion fails.
 */
export async function includeFilesystemTranslations(
    value: CompilationResult,
    reference: ArtifactReference,
    services: { repository: FilesystemRepository; configuration: ResolvedFilesystemLoaderConfiguration },
    context: TransformHookContext,
): Promise<void> {
    const { repository, configuration } = services;
    const source = repository.sources.get(reference.id.path);
    const location = source === undefined ? undefined : translationLocation(source, repository);
    if (location === undefined || !("read" in value)) {
        return;
    }
    if (value.type === "asset" && value.metadata.mimeType.split(";", 1)[0]?.trim() === "text/markdown") {
        throw new TypeError(
            "filesystemLoader({ translations: true }) requires markdownParser before it in the plugin list.",
        );
    }
    if (value.type !== "document") {
        return;
    }
    const inputs = await discoverFilesystemTranslations(location, repository, configuration, context);
    await queueTranslations(inputs, value.metadata.id, repository, context);
}

/**
 * Resolves candidate sources and queues them without awaiting their transformations.
 *
 * @param inputs Absolute candidate source URLs.
 * @param sourceId Parsed canonical document identifier.
 * @param repository Expected associations owned by this loader.
 * @param context Borrowed importer-bound transform services.
 * @returns Completion of resolution and queued inclusion.
 * @rejects If candidates cannot resolve, conflict, or cannot be included.
 */
async function queueTranslations(
    inputs: readonly Input[],
    sourceId: string,
    repository: FilesystemRepository,
    context: TransformHookContext,
): Promise<void> {
    for (const input of inputs) {
        context.signal.throwIfAborted();
        const target = await context.resolve(input);
        if (target?.type !== "artifact") {
            throw new TypeError(`Unable to resolve translation candidate ${String(input)} to an artifact.`);
        }
        const previous = repository.expectedTranslations.get(target.id.path);
        if (previous !== undefined && previous !== sourceId) {
            throw new TypeError(`Translation ${target.id.path} was discovered for conflicting source IDs.`);
        }
        repository.expectedTranslations.set(target.id.path, sourceId);
        context.include(target);
    }
}

/**
 * Validates discovered candidates after queued compilation has finished, without reading contents.
 *
 * @param repository Completed inventory.
 * @param expected Current build's candidate paths and canonical document IDs.
 * @throws {TypeError} If a candidate is absent, unparsed, or declares the wrong canonical source.
 */
export function validateFilesystemTranslations(repository: Repository, expected: ReadonlyMap<string, string>): void {
    for (const [path, sourceId] of expected) {
        const translation = repository.getArtifact(path);
        if (translation?.type !== "translation" || translation.metadata.sourceId !== sourceId) {
            throw new TypeError(`Translation ${path} must be a parsed translation with source_id ${sourceId}.`);
        }
    }
}
