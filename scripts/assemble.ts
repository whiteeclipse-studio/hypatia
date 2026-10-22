/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateManifest, writeManifest } from "@whiteeclipse/documentation/build-output";

/**
 * Reads optional application-owned static hosting headers without hiding other filesystem errors.
 *
 * @param directory - Built client directory.
 * @returns Header rules, or an empty string when no header file was generated.
 * @rejects If an existing header file cannot be read.
 */
async function readHeaders(directory: string): Promise<string> {
    try {
        return await readFile(resolve(directory, "_headers"), "utf8");
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            return "";
        }
        throw error;
    }
}

/**
 * Activates the complete candidate while preserving the previous output if replacement fails.
 *
 * @param staging - Fully assembled and validated candidate.
 * @param root - Repository root.
 * @param cache - Directory for the previous output during replacement.
 * @returns Completion after activation and removal of the previous generated output.
 * @rejects If output cannot be replaced or cleaned up.
 */
async function activate(staging: string, root: string, cache: string): Promise<void> {
    const destination = resolve(root, "dist");
    const previous = resolve(cache, `website-previous-${crypto.randomUUID()}`);
    let hadPrevious = false;
    try {
        await rename(destination, previous);
        hadPrevious = true;
    } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
            throw error;
        }
    }
    try {
        await rename(staging, destination);
    } catch (error) {
        if (hadPrevious) {
            await rename(previous, destination);
        }
        throw error;
    }
    if (hadPrevious) {
        await rm(previous, { recursive: true, force: true });
    }
}

/**
 * Copies landing client files to the site root and documentation client files to docs, then validates the whole output.
 *
 * @param root - Repository root containing both completed application builds.
 * @returns Completion after the combined static site replaces root dist.
 * @rejects If either output is missing, copying fails, or its manifest is invalid; the existing site remains intact.
 */
export async function assembleSite(root: string): Promise<void> {
    const landing = resolve(root, "apps/landing/dist/client");
    const documentation = resolve(root, "apps/documentation/dist/client");
    const { sources } = await validateManifest(documentation);
    const cache = resolve(root, ".cache");
    await mkdir(cache, { recursive: true });
    const staging = await mkdtemp(resolve(cache, "website-build-"));
    try {
        await cp(landing, staging, { recursive: true });
        await cp(documentation, resolve(staging, "docs"), { recursive: true });
        const headers = (await Promise.all([readHeaders(landing), readHeaders(documentation)]))
            .filter(Boolean)
            .join("\n");
        if (headers !== "") {
            await writeFile(resolve(staging, "_headers"), headers);
        }
        await writeManifest(staging, sources);
        await activate(staging, root, cache);
    } finally {
        await rm(staging, { recursive: true, force: true });
    }
}
