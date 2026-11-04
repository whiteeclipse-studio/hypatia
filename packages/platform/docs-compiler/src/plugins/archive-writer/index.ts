/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CompilerPlugin } from "../../types/index.js";
import {
    type ArchiveWriterConfiguration,
    DEFAULT_ARCHIVE_WRITER_CONFIGURATION,
    resolveConfiguration,
} from "./configuration.js";
import { writeRepositoryArchive } from "./write.js";


export { DEFAULT_ARCHIVE_WRITER_CONFIGURATION, type ArchiveWriterConfiguration };

/**
 * Writes one repository-ID-named .tar.gz archive during one-shot pipeline finalization.
 * Uses Bun's native TAR/gzip implementation without adding an archive dependency.
 *
 * @param configuration Output directory, defaulting to ./dist/docs.
 * @returns A Bun-only closeBundle plugin; watch pipelines do not execute this hook.
 * @throws {TypeError} If the output directory is empty.
 */
export function archiveWriter(configuration: ArchiveWriterConfiguration = {}): CompilerPlugin {
    const options = resolveConfiguration(configuration);
    return {
        name: "archive-writer",
        async closeBundle(repositories) {
            for (const repository of repositories) {
                await writeRepositoryArchive(repository, options.outputDirectory, this.signal);
            }
        },
    };
}
