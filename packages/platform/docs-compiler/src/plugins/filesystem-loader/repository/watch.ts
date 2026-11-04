/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { watch, type WatchEventType } from "node:fs";
import { stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import type { Reference, WatchSubscriptionContext } from "../../../types/index.js";
import type { ResolvedFilesystemLoaderConfiguration } from "../configuration.js";
import { fileReference, type FilesystemRepository, isExcluded, isSelected, isWithin } from "./index.js";
import { fileVersion } from "./resolve.js";
import { translationsCatalogue } from "../translations.js";


/**
 * Starts a native recursive repository watcher managed by the compiler subscription lifetime.
 *
 * @param repository Canonical directory and source inventory.
 * @param configuration File-selection rules for change notifications.
 * @param context Session cancellation, invalidation, and recoverable error reporting.
 * @returns Cleanup closing the watcher; cancellation also closes it.
 * @throws {Error} If recursive watching cannot be started on this filesystem or runtime.
 */
export function watchRepository(
    repository: FilesystemRepository,
    configuration: ResolvedFilesystemLoaderConfiguration,
    context: WatchSubscriptionContext,
): () => void {
    const watcher = watch(repository.directory, { recursive: true, signal: context.signal }, (type, filename) => {
        void invalidateChange(repository, configuration, context, { type, filename }).catch(context.reportError);
    });

    watcher.on("error", context.reportError);
    return watcher.close.bind(watcher);
}

/** Native change notification relative to the watched repository directory. */
interface FilesystemEvent {
    /** Content change or inventory rename notification. */
    readonly type: WatchEventType;
    /** Changed path, or null when the watcher cannot identify a path. */
    readonly filename: string | null;
}

/**
 * Compares a watched file with its last resolved version without rereading its bytes.
 *
 * @param file Previously discovered absolute path.
 * @param version Last resolved stat version.
 * @returns Whether the file changed or became inaccessible; the build reports access failures.
 */
async function sourceChanged(file: string, version: string): Promise<boolean> {
    try {
        return fileVersion(await stat(file, { bigint: true })) !== version;
    } catch {
        return true;
    }
}

/**
 * Invalidates changed files and their repository inventory without storing artifact content.
 * Coarse directory events compare stat versions so unchanged descendants can still be reused.
 *
 * @param repository Watched repository and latest discovered file identities.
 * @param configuration File-selection rules used to filter events.
 * @param context Session notifications and cancellation.
 * @param event Filesystem event and optional repository-relative filename.
 * @returns Completion of version checks and change notification.
 */
async function invalidateChange(
    repository: FilesystemRepository,
    configuration: ResolvedFilesystemLoaderConfiguration,
    context: WatchSubscriptionContext,
    event: FilesystemEvent,
): Promise<void> {
    const changes: Reference[] = [repository.reference];
    const changed = event.filename === null ? repository.directory : resolve(repository.directory, event.filename);
    const catalogues = changedCatalogues(repository, changed);
    if (event.filename !== null) {
        const path = relative(repository.directory, changed).split(sep).join("/");
        if (!isWithin(repository.directory, changed) || isExcluded(path, configuration)) {
            return;
        }

        if (isUnselectedChange(event, path, configuration, catalogues)) {
            const containsSources = [...repository.files.keys()].some(file => isWithin(changed, file));
            if (!containsSources) {
                return;
            }
        }
    }

    changes.push(...catalogues);

    for (const [file, version] of [...repository.files]) {
        if (version !== undefined && isWithin(changed, file) && (await sourceChanged(file, version))) {
            changes.push(fileReference(repository, file));
        }
    }
    context.invalidate(changes);
}

/**
 * Identifies changes needing a known-source check before rebuilding the repository.
 *
 * @param event Native event.
 * @param path Repository-relative event path.
 * @param configuration Discovery selection rules.
 * @param catalogues Discovery dependencies already affected by the event.
 * @returns Whether this is an otherwise unselected content event.
 */
function isUnselectedChange(
    event: FilesystemEvent,
    path: string,
    configuration: ResolvedFilesystemLoaderConfiguration,
    catalogues: readonly Reference[],
): boolean {
    return event.type === "change" && !isSelected(path, configuration) && catalogues.length === 0;
}

/**
 * Selects discovery-only dependencies affected by a file, directory, or coarse repository event.
 *
 * @param repository Known translation discovery directories.
 * @param changed Event path within or above a catalogue directory.
 * @returns Watch-only catalogue references to invalidate.
 */
function changedCatalogues(repository: FilesystemRepository, changed: string): readonly Reference[] {
    const matches = [...repository.translationDirectories].some(
        directory => isWithin(directory, changed) || isWithin(changed, directory),
    );
    return matches ? [translationsCatalogue(repository)] : [];
}
