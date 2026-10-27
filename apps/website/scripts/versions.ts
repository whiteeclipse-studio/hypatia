/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import application from "../package.json";

/** Application and reusable package identities included in the deployment record. */
interface IncludedVersions {
    application: { name: string; version: string };
    packages: Record<string, string>;
}

/**
 * Reads the installed version beside a package's declared dist or src entrypoint.
 *
 * @param entry - Resolvable package entrypoint.
 * @returns Its package version.
 * @rejects For missing package metadata or malformed version fields.
 */
async function packageVersion(entry: string): Promise<string> {
    const path = resolve(dirname(fileURLToPath(import.meta.resolve(entry))), "../package.json");
    const metadata: unknown = JSON.parse(await readFile(path, "utf8"));
    if (
        typeof metadata !== "object" ||
        metadata === null ||
        !("version" in metadata) ||
        typeof metadata.version !== "string"
    ) {
        throw new Error(`Missing package version for ${entry}`);
    }
    return metadata.version;
}

/**
 * Captures the installed workspace versions instead of maintaining a parallel release label.
 *
 * @returns Application and included reusable package versions.
 * @rejects For unreadable dependency metadata.
 */
export async function includedVersions(): Promise<IncludedVersions> {
    return {
        application: { name: application.name, version: application.version },
        packages: {
            "@whiteeclipse/documentation-builder": await packageVersion("@whiteeclipse/documentation-builder"),
            "@whiteeclipse/core-ui": await packageVersion("@whiteeclipse/core-ui/styles.css"),
        },
    };
}
