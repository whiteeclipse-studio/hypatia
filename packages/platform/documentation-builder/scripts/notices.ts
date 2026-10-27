/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { objectValue, stringValue } from "../src/artifact/guards.ts";
import { isMissingFile } from "../src/build/files.ts";

/** A bundled dependency and the root that contains its original notices. */
interface DependencyNotice {
    name: string;
    version: string;
    root: string;
}

/**
 * Retains dependency licence and attribution files for code embedded in the distribution.
 *
 * @param files - Dependency modules observed by the actual bundle builds.
 * @returns Complete original notices, grouped by dependency and version.
 * @rejects For missing licence files or unreadable package metadata.
 */
export async function thirdPartyNotices(files: Set<string>): Promise<string> {
    const packages = new Map<string, DependencyNotice>();
    for (const file of files) {
        const dependency = await dependencyPackage(dirname(file));
        packages.set(`${dependency.name}@${dependency.version}`, dependency);
    }
    const sections: string[] = [];
    for (const [identity, dependency] of [...packages.entries()].sort(function byIdentity(left, right): number {
        return left[0].localeCompare(right[0], "en");
    })) {
        const names = await readdir(dependency.root);
        const entries = names.filter(function noticeFile(name): boolean {
            return /^(?:licen[sc]e|copying|notice)(?:[.-].*)?$/iu.test(name);
        });
        if (entries.length === 0) {
            entries.push(
                ...names.filter(function readme(name): boolean {
                    return /^readme(?:\..*)?$/iu.test(name);
                }),
            );
        }
        if (entries.length === 0) {
            throw new Error(`Missing bundled dependency notices: ${identity}`);
        }
        const notices = await Promise.all(
            entries.map(async function contents(name): Promise<string> {
                return `${name}\n\n${await readFile(join(dependency.root, name), "utf8")}`;
            }),
        );
        sections.push(`${identity}\n${"=".repeat(identity.length)}\n\n${notices.join("\n\n")}`);
    }
    return `Third-party notices for bundled distribution code\n\n${sections.join("\n\n")}`;
}

/**
 * Finds the owning package without assuming node_modules layout or exported package.json paths.
 *
 * @param directory - Module's containing directory.
 * @returns Owning package identity and root.
 * @rejects For missing package ownership or unreadable metadata.
 */
async function dependencyPackage(directory: string): Promise<DependencyNotice> {
    let current = directory;
    while (dirname(current) !== current) {
        try {
            const json: unknown = JSON.parse(await readFile(join(current, "package.json"), "utf8"));
            const metadata = objectValue(json);
            if (typeof metadata["name"] === "string" && typeof metadata["version"] === "string") {
                return {
                    name: stringValue(metadata["name"]),
                    version: stringValue(metadata["version"]),
                    root: current,
                };
            }
        } catch (error) {
            if (!isMissingFile(error)) {
                throw error;
            }
        }
        current = dirname(current);
    }
    throw new Error(`Cannot identify bundled dependency: ${directory}`);
}
