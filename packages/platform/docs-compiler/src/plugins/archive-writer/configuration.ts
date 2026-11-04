/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { resolve } from "node:path";


/** Output location for one gzip-compressed TAR per repository. */
export interface ArchiveWriterConfiguration {
    /** Directory relative to the process working directory; defaults to ./dist/docs. */
    readonly outputDirectory?: string;
}

/** Default archive-writer options; no compression package is required. */
export const DEFAULT_ARCHIVE_WRITER_CONFIGURATION = Object.freeze({ outputDirectory: "./dist/docs" });

/**
 * Captures an absolute output directory independently of later working-directory changes.
 *
 * @param configuration Optional output location.
 * @returns Frozen options with an absolute output directory.
 * @throws {TypeError} If the output directory is empty.
 */
export function resolveConfiguration(
    configuration: ArchiveWriterConfiguration,
): Readonly<Required<ArchiveWriterConfiguration>> {
    const outputDirectory = configuration.outputDirectory ?? DEFAULT_ARCHIVE_WRITER_CONFIGURATION.outputDirectory;
    if (outputDirectory === "") {
        throw new TypeError("Archive output directory must not be empty.");
    }
    return Object.freeze({ outputDirectory: resolve(outputDirectory) });
}
