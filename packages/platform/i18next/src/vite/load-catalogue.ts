/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { parseDocument } from "yaml";
import { createCatalogue, type CatalogueEntry, type TranslationCatalogue } from "../catalogue/index.ts";

/** A validated catalogue and the YAML sources tracked by the build. */
export interface LoadedCatalogue {
    readonly catalogue: TranslationCatalogue;
    readonly files: readonly string[];
}

/**
 * Loads application YAML files, deriving locale and namespace identities from their paths.
 *
 * @param directory - The application's locales directory, alongside src.
 * @returns A validated catalogue and its source paths; an absent directory produces an empty catalogue.
 * @rejects For invalid paths, YAML, catalogue data, collisions, empty locales, or filesystem failures.
 */
export async function loadCatalogue(directory: string): Promise<LoadedCatalogue> {
    const files = await yamlFiles(directory);
    const entries: CatalogueEntry[] = [];
    for (const file of files) {
        const [locale = "", ...path] = relative(directory, file).split(sep);
        if (path.length === 0) {
            throw new Error(`Translations must be in locales/<language>/**/*.yaml: ${file}`);
        }
        const namespace = path.join(".").slice(0, -".yaml".length);
        entries.push({ locale, namespace, messages: await readMessages(file) });
    }

    try {
        return { catalogue: createCatalogue(entries), files };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${message}\nTranslation sources:\n${files.join("\n")}`, { cause: error });
    }
}

/**
 * Finds YAML sources in stable path order without following symlinks.
 *
 * @param directory - Directory to scan recursively.
 * @returns Sorted YAML file paths.
 * @rejects On filesystem errors other than an absent directory.
 */
async function yamlFiles(directory: string): Promise<string[]> {
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            return [];
        }
        throw error;
    }

    const files: string[] = [];
    for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await yamlFiles(path)));
        } else if (entry.isFile() && entry.name.endsWith(".yaml")) {
            files.push(path);
        }
    }
    return files.sort();
}

/**
 * Parses YAML while preserving an empty document as an empty namespace.
 *
 * @param file - YAML source path.
 * @returns Parsed messages for catalogue validation.
 * @rejects On malformed YAML, duplicate keys, unreadable files, or excessive alias expansion.
 */
async function readMessages(file: string): Promise<unknown> {
    try {
        const document = parseDocument(await readFile(file, "utf8"), { uniqueKeys: true, stringKeys: true });
        if (document.errors.length > 0) {
            throw new Error(document.errors[0]?.message);
        }
        return document.contents === null ? {} : document.toJS({ maxAliasCount: 100 });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid translations in ${file}: ${message}`, { cause: error });
    }
}
