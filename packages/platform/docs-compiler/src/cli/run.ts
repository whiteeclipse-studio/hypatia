/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import defaultLogging from "@whiteeclipse/log/default";
import { compile } from "../index.js";
import { markdownParser } from "../plugins/markdown-parser/index.js";
import { filesystemLoader } from "../plugins/filesystem-loader/index.js";
import { linkResolver } from "../plugins/link-resolver/index.js";
import { archiveWriter } from "../plugins/archive-writer/index.js";
import type { CliArguments } from "./arguments.js";


/**
 * Writes archives and releases compiler resources before flushing CLI-owned logging.
 *
 * @param options Validated command-line settings.
 * @returns Completion of one-shot compilation and cleanup.
 * @rejects If compilation, archive writing, or disposal fails.
 */
export async function run(options: CliArguments): Promise<void> {
    await using resources = new AsyncDisposableStack();
    resources.use(defaultLogging);
    resources.use(
        await compile({
            repositories: options.repositories,
            plugins: [
                markdownParser(options.markdown),
                filesystemLoader(options.filesystem),
                linkResolver(),
                archiveWriter(options.archive),
            ],
            watch: false,
        }),
    );
}
