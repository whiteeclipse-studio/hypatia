/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";
import { SerializedArtifactSchema } from "../serialization/artifact.js";


const executable = fileURLToPath(new URL("./index.ts", import.meta.url));
let directory: string;
let repository: string;
let cache: string;

beforeEach(async () => {
    directory = await realpath(await mkdtemp(join(tmpdir(), "docs-compiler-cli-")));
    repository = join(directory, "project");
    cache = join(directory, "cache");
    await mkdir(join(repository, "docs/translations"), { recursive: true });
    await mkdir(cache);
    await writeFile(
        join(repository, "docs/README.md"),
        `---
id: cli-example
---
# Example

[[reference.md|Reference]]

[Reference](./reference.md#usage)

> [!NOTE]
> A callout.
`,
    );
    await writeFile(join(repository, "docs/reference.md"), "# Reference\n\n## Usage\n");
    await writeFile(
        join(repository, "docs/translations/README.fr.md"),
        `---
id: cli-example-fr
source_id: cli-example
---
# Exemple
`,
    );
});

afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
});

/**
 * Runs a fresh Bun process so runtime APIs and resource disposal match the executable.
 *
 * @param args CLI arguments.
 * @param cwd Invocation directory, independent of the loader's cwd.
 * @returns Captured exit status and streams.
 */
function invoke(args: readonly string[], cwd = repository) {
    return spawnSync("bun", [executable, ...args], {
        cwd,
        encoding: "utf8",
        timeout: 15_000,
        env: { ...process.env, TMPDIR: cache, LOG_LEVEL: "error" },
    });
}

/**
 * Reads serialized artifacts using Bun's native gzip TAR reader in a separate process.
 *
 * @param path Archive to inspect.
 * @returns Validated artifact records.
 */
function readArchive(path: string) {
    const script = `
        const files = await new Bun.Archive(await Bun.file(process.argv[1]).arrayBuffer()).files();
        const records = [];
        for (const [name, file] of files) {
            if (name.startsWith("artifacts/")) records.push(JSON.parse(await file.text()));
        }
        process.stdout.write(JSON.stringify(records));
    `;
    const result = spawnSync("bun", ["--eval", script, path], { encoding: "utf8", timeout: 15_000 });
    expect(result.status, result.stderr).toBe(0);
    return SerializedArtifactSchema.array().parse(JSON.parse(result.stdout));
}

it("builds '.' with translations, syntax extensions, and resolved links, then cleans its cache", async () => {
    const result = invoke([]);
    expect(result.status, result.stderr).toBe(0);
    const records = readArchive(join(repository, "dist/docs/project.tgz"));
    expect(records.some(record => record.type === "translation")).toBe(true);
    const article = JSON.stringify(records.find(record => record.path === "docs/readme.md"));
    expect(article).toContain("wikilink");
    expect(article).toContain("callout");
    expect(article).toContain("docs/reference.md#usage");
    expect(await readdir(cache)).toEqual([]);
});

it.each(["translations", "wikilinks", "callouts"])("disables %s independently", flag => {
    const result = invoke(["--include", "docs/README.md", `--no-${flag}`]);
    expect(result.status, result.stderr).toBe(0);
    const records = readArchive(join(repository, "dist/docs/project.tgz"));
    if (flag === "translations") {
        expect(records.some(record => record.type === "translation")).toBe(false);
    } else {
        const article = JSON.stringify(records.find(record => record.path === "docs/readme.md"));
        expect(article).toContain(flag === "wikilinks" ? "[[reference.md|Reference]]" : "[!NOTE]");
    }
});

it("builds multiple inputs and keeps relative output based on the invocation directory", async () => {
    const second = join(directory, "second");
    await mkdir(join(second, "docs"), { recursive: true });
    await writeFile(join(second, "docs/README.md"), "# Second\n");
    const result = invoke(["-C", directory, "project", "second", "-o", "archives"], directory);
    expect(result.status, result.stderr).toBe(0);
    expect((await readdir(join(directory, "archives"))).sort()).toEqual(["project.tgz", "second.tgz"]);
    expect(await readdir(cache)).toEqual([]);
});

it("honors replacement includes and exclusions", () => {
    const result = invoke(["--include", "docs/reference.md", "--exclude", "docs/translations/**"]);
    expect(result.status, result.stderr).toBe(0);
    expect(readArchive(join(repository, "dist/docs/project.tgz")).map(record => record.path)).toEqual([
        "docs/reference.md",
    ]);
});

it("shows help without initializing the compiler or writing output", async () => {
    const result = invoke(["--help", resolve(directory, "missing")]);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Usage: docs-compiler");
    expect(await readdir(cache)).toEqual([]);
    expect(await readdir(repository)).toEqual(["docs"]);
});

it("reports invalid arguments and build failures, releasing temporary resources", async () => {
    const invalid = invoke(["--unknown"]);
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain("docs-compiler:");
    const missing = invoke([resolve(directory, "missing")]);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("docs-compiler:");
    const output = join(directory, "not-a-directory");
    await writeFile(output, "occupied");
    const failedWrite = invoke(["-o", output]);
    expect(failedWrite.status).toBe(1);
    expect(failedWrite.stderr).toContain("docs-compiler:");
    expect(await readdir(cache)).toEqual([]);
});
