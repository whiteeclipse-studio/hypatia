/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { parseArgs } from "node:util";
import type { FilesystemLoaderConfiguration } from "../plugins/filesystem-loader/configuration.js";
import type { MarkdownParserConfiguration } from "../plugins/markdown-parser/configuration.js";
import type { ArchiveWriterConfiguration } from "../plugins/archive-writer/configuration.js";


/** CLI settings, kept separate from plugin construction and filesystem access. */
export interface CliArguments {
    readonly help: boolean;
    readonly repositories: readonly string[];
    readonly filesystem: FilesystemLoaderConfiguration;
    readonly markdown: MarkdownParserConfiguration;
    readonly archive: ArchiveWriterConfiguration;
}

/** Usage for the exploratory one-shot compiler wrapper. */
export const HELP = `Usage: docs-compiler [repositories...] [options]

Build local documentation into gzip TAR archives. Repositories default to '.'.

Options:
  -C, --cwd <directory>         Base for repository inputs (default: current directory)
      --include <glob>          Repeatable replacement include patterns
                                (default: docs/**/*.md, LICENCE, LICENSE,
                                 LICENCE.md, LICENSE.md)
      --exclude <glob>          Repeatable exclusions (default: none)
      --translations           Include translations (default: enabled)
      --no-translations        Disable translation discovery
      --wikilinks              Parse wikilinks (default: enabled)
      --no-wikilinks           Disable wikilinks
      --callouts               Parse callouts (default: enabled)
      --no-callouts            Disable callouts
  -o, --output-directory <dir>  Archive destination (default: ./dist/docs)
  -h, --help                    Show this help without compiling

Boolean switches use the last supplied value. Use -- before paths starting with '-'.
Output paths are relative to the invocation directory; --cwd affects inputs only.

Examples:
  bunx @whiteeclipse/docs-compiler@alpha
  bunx @whiteeclipse/docs-compiler@alpha ./project-a ./project-b -o ./archives
  bunx @whiteeclipse/docs-compiler@alpha --include 'docs/**/*.md' --no-callouts

Exploratory implementation associated with draft RFC-0005; acceptance is pending.
`;

/**
 * Rejects empty values before they can become filesystem paths or glob patterns.
 *
 * @param values Parsed option values.
 * @throws {TypeError} If an option has an empty value.
 */
function validateValues(values: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(values)) {
        if (value === "" || (Array.isArray(value) && value.includes(""))) {
            throw new TypeError(`Option --${name} must not be empty.`);
        }
    }
}

/**
 * Parses command-line options without initializing the compiler or its plugins.
 *
 * @param args Arguments following the executable.
 * @returns Settings preserving plugin defaults except for enabled CLI syntax and translations.
 * @throws {TypeError} If an option is unknown, missing its value, or empty.
 */
export function parseArguments(args: readonly string[]): CliArguments {
    const { values, positionals } = parseArgs({
        args: [...args],
        allowPositionals: true,
        allowNegative: true,
        options: {
            cwd: { type: "string", short: "C" },
            include: { type: "string", multiple: true },
            exclude: { type: "string", multiple: true },
            translations: { type: "boolean", default: true },
            wikilinks: { type: "boolean", default: true },
            callouts: { type: "boolean", default: true },
            "output-directory": { type: "string", short: "o" },
            help: { type: "boolean", short: "h" },
        },
    });
    validateValues(values);
    if (positionals.includes("")) {
        throw new TypeError("Repository paths must not be empty.");
    }
    return {
        help: values.help ?? false,
        repositories: positionals.length === 0 ? ["."] : positionals,
        filesystem: {
            ...(values.cwd === undefined ? {} : { cwd: values.cwd }),
            ...(values.include === undefined ? {} : { include: values.include }),
            ...(values.exclude === undefined ? {} : { exclude: values.exclude }),
            translations: values.translations,
        },
        markdown: { wikilinks: values.wikilinks, callouts: values.callouts },
        archive: values["output-directory"] === undefined ? {} : { outputDirectory: values["output-directory"] },
    };
}
