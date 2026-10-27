/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { parseDocument } from "yaml";
import { normalizeLocale } from "../locale.ts";
import type { LocaleResources, TranslationDictionary, TranslationValue } from "../types.ts";

/** Translation data and source files collected for Vite's dependency graph. */
export interface LocaleFiles {
    resources: LocaleResources;
    files: string[];
}

/**
 * Loads YAML namespaces, rejecting invalid translations and same-language namespace collisions.
 *
 * @param directory - Absolute locales directory alongside the application's src folder.
 * @returns All locale resources and their source paths.
 * @rejects On filesystem errors, malformed YAML, invalid locale names, invalid values, or namespace collisions.
 */
export async function loadLocaleFiles(directory: string): Promise<LocaleFiles> {
    const files = await yamlFiles(directory);
    const resources: LocaleResources = {};
    const origins = new Map<string, string>();
    for (const file of files) {
        const parts = relative(directory, file).split(/[\\/]/u);
        const language = normalizeLocale(parts.shift() ?? "");
        if (language === undefined || parts.length === 0) {
            throw new Error(`Translations must be in locales/<language>/**/*.yaml: ${file}`);
        }
        const namespace = parts.join(".").slice(0, -".yaml".length);
        const identity = `${language}:${namespace}`;
        const previous = origins.get(identity);
        if (previous !== undefined) {
            throw new Error(`Translation namespace collision for ${identity}: ${previous} and ${file}`);
        }
        origins.set(identity, file);
        const translations = await readTranslations(file);
        const namespaces = Object.hasOwn(resources, language) ? resources[language] : {};
        resources[language] = { ...namespaces, [namespace]: translations };
    }
    return { resources, files };
}

/**
 * Finds YAML files recursively, allowing an initially absent locales directory.
 *
 * @param directory - Directory to scan.
 * @returns Sorted YAML paths; symlinks and other file extensions are ignored.
 * @rejects On filesystem errors other than a missing directory.
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
    return files.sort((left, right) => left.localeCompare(right));
}

/**
 * Parses a namespace with duplicate-key detection and bounded alias expansion.
 *
 * @param file - YAML source path.
 * @returns The validated translation mapping.
 * @rejects On unreadable files, invalid YAML, non-mapping roots, or non-string leaves.
 */
async function readTranslations(file: string): Promise<TranslationDictionary> {
    const document = parseDocument(await readFile(file, "utf8"), { uniqueKeys: true, stringKeys: true });
    if (document.errors.length > 0) {
        throw new Error(`Invalid translations in ${file}: ${document.errors[0]?.message}`);
    }
    const translations: unknown = document.toJS({ maxAliasCount: 100 });
    if (!isDictionary(translations)) {
        throw new Error(`Translations must be a mapping with string leaves: ${file}`);
    }
    return translations;
}

/**
 * Validates YAML mappings without accepting scalar or list roots.
 *
 * @param value - Parsed YAML value.
 * @returns Whether the value is a supported translation dictionary.
 */
function isDictionary(value: unknown): value is TranslationDictionary {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every(isTranslation)
    );
}

/**
 * Validates nested entries and lists; YAML numbers, booleans, and null are rejected.
 *
 * @param value - Entry to validate.
 * @returns Whether i18next can consume the entry as translation data.
 */
function isTranslation(value: unknown): value is TranslationValue {
    if (typeof value === "string") {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every(isTranslation);
    }
    return isDictionary(value);
}
