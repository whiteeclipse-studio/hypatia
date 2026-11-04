/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { openSource, resolveSource } from "#archive-reader-source";
import type { CompilerPlugin } from "../../types/index.js";
import {
    type ArchiveReaderConfiguration,
    DEFAULT_ARCHIVE_READER_CONFIGURATION,
    resolveConfiguration,
} from "./configuration.js";
import { readBoundedStream } from "./stream.js";
import { readTar } from "./tar.js";
import { decodeRepository } from "./decode.js";


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
        async resolveId(input, importer) {
            if (importer !== undefined) {
                return undefined;
            }
            const source = resolveSource(input);
            if (source === undefined) {
                return undefined;
            }
            sources.add(source);
            const reference = { type: "repository" as const, id: source };
            if (configuration.subscribe !== undefined) {
                const subscribe = configuration.subscribe;
                await this.watch(reference, context =>
                    subscribe(
                        source,
                        () => {
                            context.invalidate(reference);
                        },
                        context.signal,
                    ),
                );
            }
            return reference;
        },
        async load(reference) {
            if (reference.type !== "repository" || !sources.has(reference.id)) {
                return undefined;
            }
            const stream = await (configuration.openSource ?? openSource)(reference.id, this.signal);
            const archive = await readBoundedStream(stream, options.maxArchiveBytes, this.signal);
            const entries = await readTar(archive, options, this.signal);
            return decodeRepository(entries, this);
        },
    };
}
