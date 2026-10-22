/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import type { RepositoryConfiguration, RepositorySnapshot } from "./types";

const commandTimeout = 120_000;
const commandBytes = 1_048_576;

/**
 * Runs Git with bounded output, no shell, no credential prompts, and no inherited Git configuration.
 *
 * @param args - Explicit Git argument vector.
 * @param maximum - Maximum stdout or stderr size.
 * @returns Raw stdout bytes.
 * @rejects If Git fails, times out, or exceeds the output limit.
 */
export async function git(args: readonly string[], maximum = commandBytes): Promise<Buffer> {
    return new Promise<Buffer>((resolveResult, reject) => {
        execFile(
            "git",
            ["--no-pager", "-c", "core.hooksPath=/dev/null", "-c", "credential.helper=", ...args],
            {
                encoding: "buffer",
                timeout: commandTimeout,
                maxBuffer: maximum,
                env: {
                    PATH: process.env["PATH"],
                    HOME: process.env["HOME"],
                    TMPDIR: process.env["TMPDIR"],
                    GIT_CONFIG_NOSYSTEM: "1",
                    GIT_CONFIG_GLOBAL: "/dev/null",
                    GIT_TERMINAL_PROMPT: "0",
                    GIT_ALLOW_PROTOCOL: "https",
                },
            },
            (error, stdout) => {
                if (error === null) {
                    resolveResult(stdout);
                    return;
                }
                reject(error instanceof Error ? error : new Error("Git operation failed.", { cause: error }));
            },
        );
    });
}

/**
 * Validates configured names and credential-free HTTPS source URLs before using paths or Git.
 *
 * @param configuration - Application-owned repository entry.
 * @throws {Error} If the name or URL is unsafe.
 */
export function validateRepository(configuration: RepositoryConfiguration): void {
    const url = new URL(configuration.url);
    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(configuration.name) ||
        ["assets", "index", "build-manifest"].includes(configuration.name) ||
        url.protocol !== "https:" ||
        url.username !== "" ||
        url.password !== "" ||
        url.search !== "" ||
        url.hash !== ""
    ) {
        throw new Error(`Invalid documentation repository configuration: ${configuration.name}`);
    }
}

/**
 * Refreshes a cached object database and resolves remote main once for the entire import.
 *
 * @param configuration - Validated public source repository.
 * @param cache - Application cache root.
 * @returns The object database path and full commit identity.
 * @rejects If initialization, fetching, or commit resolution fails; stale cache is never substituted.
 */
export async function fetchRepository(
    configuration: RepositoryConfiguration,
    cache: string,
): Promise<{ database: string; source: RepositorySnapshot }> {
    validateRepository(configuration);
    const key = createHash("sha256").update(configuration.url).digest("hex");
    const database = resolve(cache, "repositories", `${configuration.name}-${key}.git`);
    await mkdir(database, { recursive: true });
    await git(["init", "--bare", database]);
    await git(["--git-dir", database, "config", "remote.origin.url", configuration.url]);
    await git([
        "--git-dir",
        database,
        "fetch",
        "--depth=1",
        "--no-tags",
        "--no-recurse-submodules",
        "origin",
        "+refs/heads/main:refs/remotes/origin/main",
    ]);
    const commit = (await git(["--git-dir", database, "rev-parse", "--verify", "refs/remotes/origin/main^{commit}"]))
        .toString("utf8")
        .trim();
    if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit)) {
        throw new Error(`Invalid fetched commit for ${configuration.name}.`);
    }
    return { database, source: { name: configuration.name, url: configuration.url, commit } };
}
