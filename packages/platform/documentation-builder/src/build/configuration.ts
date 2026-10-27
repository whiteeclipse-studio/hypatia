/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { BuildOptions, DocumentationPlugin, GeneratedPageMetadata, ProcessingLimits } from "../types.ts";
import { requireCondition } from "../errors.ts";
import { arrayValue, objectValue, positiveInteger, stringValue } from "../artifact/guards.ts";
import { isMissingFile } from "./files.ts";

/** Loaded trusted configuration and its optional watcher dependency. */
export interface LoadedConfiguration {
    options: BuildOptions;
    file?: string;
}

/**
 * Imports a trusted ESM config, defaulting to repository-root documentation.config.mjs.
 *
 * @param repositoryRoot - Explicit repository root.
 * @param configFile - Optional config path relative to the repository.
 * @returns Checked configuration with its dependency path.
 * @rejects For explicit missing configs, invalid configuration, or module execution failures.
 */
export async function loadConfiguration(repositoryRoot: string, configFile?: string): Promise<LoadedConfiguration> {
    const file = resolve(repositoryRoot, configFile ?? "documentation.config.mjs");
    try {
        const info = await stat(file);
        requireCondition(/\.m?js$/u.test(file), "Configuration must be an ESM .mjs or .js file", "configuration");
        const module: unknown = await import(`${pathToFileURL(file).href}?revision=${info.mtimeMs}`);
        const options = parseConfiguration(objectValue(module)["default"]);
        return { options, file };
    } catch (error) {
        if (configFile === undefined && isMissingFile(error)) {
            return { options: {} };
        }
        throw error;
    }
}

/**
 * Checks configuration fields instead of casting an imported module to trusted TypeScript types.
 *
 * @param input - Module's default export.
 * @returns Validated build configuration.
 * @throws {DocumentationError} For malformed fields or plugins.
 */
function parseConfiguration(input: unknown): BuildOptions {
    const fields = objectValue(input);
    const options: BuildOptions = {};
    for (const key of ["repositoryRoot", "repository", "name", "commit"] as const) {
        if (fields[key] !== undefined) {
            options[key] = stringValue(fields[key]);
        }
    }
    if (fields["plugins"] !== undefined) {
        options.plugins = arrayValue(fields["plugins"]).map(parsePlugin);
    }
    if (fields["generatedPages"] !== undefined) {
        options.generatedPages = parseGeneratedPages(fields["generatedPages"]);
    }
    if (fields["limits"] !== undefined) {
        options.limits = parseLimits(fields["limits"]);
    }
    return options;
}

/**
 * Checks one trusted plugin's callable interface.
 *
 * @param value - Plugin configuration.
 * @returns The checked plugin.
 * @throws {DocumentationError} When the plugin contract is absent.
 */
function parsePlugin(value: unknown): DocumentationPlugin {
    requireCondition(
        isPlugin(value),
        "Plugins require a name, transform function, and optional string watchFiles",
        "configuration",
    );
    return value;
}

/**
 * Narrows a runtime plugin object after checking its callable boundary.
 *
 * @param value - Imported plugin.
 * @returns Whether the value implements the plugin interface.
 */
function isPlugin(value: unknown): value is DocumentationPlugin {
    if (typeof value !== "object" || value === null || !("name" in value) || !("transform" in value)) {
        return false;
    }
    if (typeof value.name !== "string" || typeof value.transform !== "function") {
        return false;
    }
    return (
        !("watchFiles" in value) ||
        (Array.isArray(value.watchFiles) &&
            value.watchFiles.every(function path(entry: unknown): boolean {
                return typeof entry === "string";
            }))
    );
}

/**
 * Checks optional generated-page overrides keyed by output path.
 *
 * @param value - Configured metadata map.
 * @returns Checked metadata entries.
 * @throws {DocumentationError} For invalid supplied textual fields.
 */
function parseGeneratedPages(value: unknown): Record<string, GeneratedPageMetadata> {
    const result: Record<string, GeneratedPageMetadata> = {};
    for (const [path, entry] of Object.entries(objectValue(value))) {
        const fields = objectValue(entry);
        const metadata: GeneratedPageMetadata = {};
        for (const key of ["id", "title", "copyrightAndLicence", "revisions"] as const) {
            if (fields[key] !== undefined) {
                metadata[key] = stringValue(fields[key]);
            }
        }
        result[path] = metadata;
    }
    return result;
}

/**
 * Reads only known positive resource overrides.
 *
 * @param value - Configured limits object.
 * @returns Supported numeric overrides.
 * @throws {DocumentationError} For invalid ceilings.
 */
function parseLimits(value: unknown): Partial<ProcessingLimits> {
    const fields = objectValue(value);
    const result: Partial<ProcessingLimits> = {};
    for (const key of ["maxFiles", "maxCompressedBytes", "maxExpandedBytes", "maxFileBytes", "timeoutMs"] as const) {
        if (fields[key] !== undefined) {
            result[key] = positiveInteger(fields[key]);
        }
    }
    return result;
}
