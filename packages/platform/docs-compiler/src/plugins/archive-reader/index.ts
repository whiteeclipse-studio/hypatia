/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { openSource, resolveSource } from "#archive-reader-source";
import type { CompilerPlugin } from "../../types";
import {
    type ArchiveReaderConfiguration,
    DEFAULT_ARCHIVE_READER_CONFIGURATION,
    resolveConfiguration,
} from "./configuration";
import { readBoundedStream } from "./stream";
import { readTar } from "./tar";
import { decodeRepository } from "./decode";


export { DEFAULT_ARCHIVE_READER_CONFIGURATION, type ArchiveReaderConfiguration };

/**
 * Loads serialized repositories from gzip-compressed TAR without running source-build plugins.
 * HTTP(S) works through web APIs; server runtimes additionally accept local files.
 *
 * @param configuration Finite input, decompression, and entry-count limits.
 * @returns An exploratory archive loader under draft RFC-0005.
 */
export function archiveReader(configuration: ArchiveReaderConfiguration = {}): CompilerPlugin {
    const options = resolveConfiguration(configuration);
    const sources = new Set<string>();
    return {
        name: "archive-reader",
        resolveId(input, importer) {
            if (importer !== undefined) {
                return undefined;
            }
            const source = resolveSource(input);
            if (source === undefined) {
                return undefined;
            }
            sources.add(source);
            return { type: "repository", id: source };
        },
        async load(reference) {
            if (reference.type !== "repository" || !sources.has(reference.id)) {
                return undefined;
            }
            const stream = await openSource(reference.id, this.signal);
            const archive = await readBoundedStream(stream, options.maxArchiveBytes, this.signal);
            const entries = await readTar(archive, options, this.signal);
            return decodeRepository(entries, this);
        },
    };
}
