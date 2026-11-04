/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { isAbsolute, resolve } from "node:path";


/** File selection and base directory for configured repository inputs. */
export interface FilesystemLoaderConfiguration {
    /** Base for relative repository inputs; defaults to the process working directory. */
    readonly cwd?: string;
    /** Repository-relative file globs; replaces the default Markdown and licence patterns. */
    readonly include?: readonly string[];
    /** Repository-relative exclusions. Translations are excluded by default unless translations is enabled. */
    readonly exclude?: readonly string[];
    /** Discover translations of parsed documents. Requires a parser before this plugin; defaults to false. */
    readonly translations?: boolean;
}

/** Validated settings captured independently of the caller's arrays. */
export type ResolvedFilesystemLoaderConfiguration = Required<FilesystemLoaderConfiguration>;

/** Default source selection; root READMEs receive no special treatment. */
export const DEFAULT_FILESYSTEM_LOADER_CONFIGURATION: ResolvedFilesystemLoaderConfiguration = Object.freeze({
    cwd: process.cwd(),
    include: Object.freeze(["docs/**/*.md", "LICENCE", "LICENSE", "LICENCE.md", "LICENSE.md"]),
    exclude: Object.freeze([]),
    translations: false,
});

/**
 * Copies and validates file globs confined to a repository root.
 *
 * @param patterns Repository-relative globs using forward slashes.
 * @returns An independent frozen list.
 * @throws {TypeError} If a glob is empty, absolute, or contains parent traversal or backslashes.
 */
function copyPatterns(patterns: readonly string[]): readonly string[] {
    for (const pattern of patterns) {
        if (pattern === "" || isAbsolute(pattern) || pattern.includes("\\") || pattern.split("/").includes("..")) {
            throw new TypeError(`Expected a repository-relative glob: ${pattern}.`);
        }
    }
    return Object.freeze([...patterns]);
}

/**
 * Resolves defaults without retaining mutable configuration supplied by the caller.
 *
 * @param configuration Optional working directory and replacement file patterns.
 * @returns Frozen loader configuration.
 * @throws {TypeError} If a file pattern is invalid.
 */
export function resolveConfiguration(
    configuration: FilesystemLoaderConfiguration,
): ResolvedFilesystemLoaderConfiguration {
    return Object.freeze({
        cwd: resolve(configuration.cwd ?? process.cwd()),
        include: copyPatterns(configuration.include ?? DEFAULT_FILESYSTEM_LOADER_CONFIGURATION.include),
        exclude: copyPatterns(
            configuration.exclude ??
                (configuration.translations === true ? [] : DEFAULT_FILESYSTEM_LOADER_CONFIGURATION.exclude),
        ),
        translations: configuration.translations ?? false,
    });
}
