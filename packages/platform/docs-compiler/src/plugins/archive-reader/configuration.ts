/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Promisable } from "type-fest";


/** Resource bounds applied separately to each input archive. */
export interface ArchiveReaderConfiguration {
    /** Maximum compressed input size, including HTTP response bytes. */
    readonly maxArchiveBytes?: number;
    /** Maximum decompressed TAR size, including headers and padding. */
    readonly maxExpandedBytes?: number;
    /** Maximum number of TAR entries, including directories. */
    readonly maxEntries?: number;
    /** Supplies archive bytes without changing the stable resolved source identity. */
    openSource?(this: void, source: string, signal: AbortSignal): Promisable<ReadableStream<Uint8Array>>;
    /** Watches replacement bytes; notify only after the new source is ready to read. */
    subscribe?(
        this: void,
        source: string,
        changed: () => void,
        signal: AbortSignal,
    ): Promisable<() => Promisable<void>>;
}

/** Finite default limits; callers may supply larger positive safe integers. */
export const DEFAULT_ARCHIVE_READER_CONFIGURATION = Object.freeze({
    maxArchiveBytes: 67_108_864,
    maxExpandedBytes: 268_435_456,
    maxEntries: 10_000,
});

/**
 * Copies resource limits and rejects invalid values before any input is read.
 *
 * @param configuration Optional per-archive overrides.
 * @returns Frozen, fully populated limits.
 * @throws {TypeError} If a bound is not a positive safe integer.
 */
export function resolveConfiguration(
    configuration: ArchiveReaderConfiguration,
): Required<Pick<ArchiveReaderConfiguration, "maxArchiveBytes" | "maxExpandedBytes" | "maxEntries">> {
    const options = {
        maxArchiveBytes: configuration.maxArchiveBytes ?? DEFAULT_ARCHIVE_READER_CONFIGURATION.maxArchiveBytes,
        maxExpandedBytes: configuration.maxExpandedBytes ?? DEFAULT_ARCHIVE_READER_CONFIGURATION.maxExpandedBytes,
        maxEntries: configuration.maxEntries ?? DEFAULT_ARCHIVE_READER_CONFIGURATION.maxEntries,
    };
    for (const [name, value] of Object.entries(options)) {
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new TypeError(`${name} must be a positive safe integer.`);
        }
    }
    return Object.freeze(options);
}
