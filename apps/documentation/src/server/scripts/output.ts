/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RepositorySnapshot } from "../repositories/types";
import { validateRepository } from "../repositories/git";

/** Complete emitted inventory and pinned source identities for an independently deployable output tree. */
export interface BuildManifest {
    sources: RepositorySnapshot[];
    files: string[];
}

/**
 * Parses one immutable source identity from the manifest.
 *
 * @param source - Untrusted source record.
 * @returns A validated public repository and full commit hash.
 * @throws {Error} If the source is malformed or not pinned to a full commit.
 */
function parseSource(source: unknown): RepositorySnapshot {
    if (
        typeof source !== "object" ||
        source === null ||
        !("name" in source) ||
        typeof source.name !== "string" ||
        !("url" in source) ||
        typeof source.url !== "string" ||
        !("commit" in source) ||
        typeof source.commit !== "string" ||
        !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(source.commit)
    ) {
        throw new Error("Invalid documentation source identity.");
    }
    validateRepository({ name: source.name, title: source.name, url: source.url });
    return { name: source.name, url: source.url, commit: source.commit };
}

/**
 * Validates source provenance independently from the emitted file inventory.
 *
 * @param value - Untrusted manifest source field.
 * @returns Validated immutable repository identities.
 * @throws {Error} If source identities are missing, duplicated, or not pinned to full commits.
 */
function validateSources(value: unknown): RepositorySnapshot[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error("Documentation manifest has no remote source identities.");
    }
    const sources: unknown[] = value;
    const names = new Set<string>();
    const result: RepositorySnapshot[] = [];
    for (const entry of sources) {
        const source = parseSource(entry);
        if (names.has(source.name)) {
            throw new Error("Duplicate documentation source identity.");
        }
        names.add(source.name);
        result.push(source);
    }
    return result;
}

/** Browser policy for app-owned scripts and sanitized documentation, including external HTTPS images. */
export const pageContentSecurityPolicy =
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";

/**
 * Enumerates the actual deployable output rather than maintaining a separate expected-file list.
 *
 * @param directory - Build output root.
 * @param prefix - Current relative directory.
 * @returns Sorted paths of all emitted regular files.
 * @rejects If traversal fails or a generated path is a symbolic link.
 */
async function listOutput(directory: string, prefix = ""): Promise<string[]> {
    const files: string[] = [];
    for (const entry of await readdir(resolve(directory, prefix), { withFileTypes: true })) {
        const path = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
        if (entry.isSymbolicLink()) {
            throw new Error(`Symbolic link in generated output: ${path}`);
        }
        if (entry.isDirectory()) {
            files.push(...(await listOutput(directory, path)));
        } else if (entry.isFile()) {
            files.push(path);
        }
    }
    return files.sort((left, right) => left.localeCompare(right, "en"));
}

/**
 * Records actual emitted files and the immutable remote sources used by this build.
 *
 * @param directory - Finished client output root, including pages and assets.
 * @param sources - Full remote main commit identities used by the build.
 * @returns Completion after the generated manifest is written and checked.
 * @rejects If output enumeration, writing, or manifest validation fails.
 */
export async function writeManifest(directory: string, sources: readonly RepositorySnapshot[]): Promise<void> {
    const indentation = 2;
    const files = [...(await listOutput(directory)), "build-manifest.json"].sort((left, right) =>
        left.localeCompare(right, "en"),
    );
    await writeFile(
        resolve(directory, "build-manifest.json"),
        JSON.stringify(
            {
                sources,
                files,
            },
            null,
            indentation,
        ),
    );
    await validateManifest(directory);
}

/**
 * Validates JSON, uniqueness, and exact agreement with the output inventory before publication.
 *
 * @param directory - Generated client output root.
 * @returns The complete validated inventory and its pinned sources.
 * @rejects If the manifest is missing, malformed, unsafe, or incomplete.
 */
export async function validateManifest(directory: string): Promise<BuildManifest> {
    const value: unknown = JSON.parse(await readFile(resolve(directory, "build-manifest.json"), "utf8"));
    if (
        typeof value !== "object" ||
        value === null ||
        !("files" in value) ||
        !Array.isArray(value.files) ||
        !value.files.every((file: unknown) => typeof file === "string")
    ) {
        throw new Error("Invalid documentation build manifest.");
    }
    const sources = validateSources("sources" in value ? value.sources : undefined);
    const files: string[] = value.files;
    const actual = await listOutput(directory);
    if (
        new Set(files).size !== files.length ||
        JSON.stringify([...files].sort((left, right) => left.localeCompare(right, "en"))) !== JSON.stringify(actual)
    ) {
        throw new Error("Documentation manifest does not match the emitted output.");
    }
    return { sources, files };
}
