/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import { includedVersions } from "./versions.ts";

/**
 * Lists actual deployable files without following symlinks.
 *
 * @param root - Generated output root.
 * @param folder - Current output-relative directory.
 * @returns Sorted output-relative file paths.
 * @rejects For filesystem failures or unexpected special files in generated output.
 */
async function listFiles(root: string, folder = ""): Promise<string[]> {
    const entries = await readdir(resolve(root, folder), { withFileTypes: true });
    const paths: string[] = [];
    for (const entry of entries) {
        const path = folder.length === 0 ? entry.name : `${folder}/${entry.name}`;
        if (entry.isDirectory()) {
            paths.push(...(await listFiles(root, path)));
        } else if (entry.isFile()) {
            paths.push(path);
        } else {
            throw new Error(`Unexpected special output file: ${path}`);
        }
    }
    return paths.sort(function byPath(left, right): number {
        return left.localeCompare(right, "en");
    });
}

/**
 * Records the actual deployment inventory, source snapshots, and included workspace versions.
 *
 * @param output - Completed static output root.
 * @param projects - Validated documentation snapshots included in this build.
 * @returns Completion after validating and writing the build manifest.
 * @rejects When a required generated page, metadata file, or baseline artifact is missing.
 */
export async function writeInventory(output: string, projects: DocumentationProject[]): Promise<void> {
    const files = await listFiles(output);
    const inventory = new Set(files);
    for (const project of projects) {
        const root = project.manifest.source.name;
        const required = [project.artifactUrl.slice(1), `${root}/manifest.json`];
        for (const page of project.manifest.pages) {
            required.push(`${root}/${page.path}`);
        }
        for (const file of project.manifest.files) {
            required.push(`${root}/${file.path}`);
        }
        for (const path of required) {
            if (!inventory.has(decodeURIComponent(path))) {
                throw new Error(`Missing generated output: ${path}`);
            }
        }
    }
    const sources = projects.map(function source(project) {
        return project.manifest.source;
    });
    const manifest = {
        formatVersion: 1,
        ...(await includedVersions()),
        sources,
        files: [...files, "build-manifest.json"],
    };
    await writeFile(resolve(output, "build-manifest.json"), `${JSON.stringify(manifest, null, "    ")}\n`);
    const actual = await listFiles(output);
    if (
        actual.length !== manifest.files.length ||
        !actual.every(function included(path): boolean {
            return manifest.files.includes(path);
        })
    ) {
        throw new Error("The build inventory does not match the static output.");
    }
    await stat(resolve(output, "index.html"));
}
