/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { execFile } from "node:child_process";
import type { BuildOptions, RepositorySource } from "../types.ts";
import { requireCondition } from "../errors.ts";

/**
 * Resolves source identity, preferring explicit values and recording actual dirty state.
 *
 * @param root - Canonical repository root.
 * @param options - Repository URL, name, and optional commit override.
 * @returns Publication source identity.
 * @rejects For missing Git identity or invalid repository metadata.
 */
export async function repositorySource(root: string, options: BuildOptions): Promise<RepositorySource> {
    const repository = normalizeRepository(
        options.repository ?? (await git(root, ["config", "--get", "remote.origin.url"])),
    );
    const name = options.name ?? new URL(repository).pathname.split("/").filter(Boolean).pop() ?? "";
    const commit = options.commit ?? (await git(root, ["rev-parse", "HEAD"]));
    const dirty = (await git(root, ["status", "--porcelain", "--untracked-files=normal"])).length > 0;
    requireCondition(/^[a-zA-Z\d][a-zA-Z\d._-]*$/u.test(name), "Invalid repository name", "provenance");
    requireCondition(/^[a-f\d]{40}(?:[a-f\d]{24})?$/u.test(commit), "Commit must be a full Git hash", "provenance");
    return { repository, name, commit, dirty };
}

/**
 * Runs Git without a shell or interpolated command text.
 *
 * @param root - Repository root.
 * @param args - Literal Git arguments.
 * @returns Trimmed command output.
 * @rejects When Git fails or exceeds its output or time limit.
 */
async function git(root: string, args: string[]): Promise<string> {
    return new Promise(function execute(resolve, reject): void {
        execFile(
            "git",
            ["-C", root, ...args],
            { timeout: 10_000, maxBuffer: 1_048_576 },
            function completed(error, stdout): void {
                if (error === null) {
                    resolve(stdout.trim());
                } else {
                    reject(new Error("Git provenance lookup failed", { cause: error }));
                }
            },
        );
    });
}

/**
 * Converts common SSH remotes to public URLs and rejects credential-bearing identities.
 *
 * @param remote - Explicit repository URL or Git remote.
 * @returns A canonical HTTP(S) repository URL without a .git suffix.
 * @throws {Error} For invalid, unsupported, or credential-bearing URLs.
 */
function normalizeRepository(remote: string): string {
    const normalized = remote.replace(/^git@(?<host>[^:]+):/u, "https://$<host>/").replace(/\.git$/u, "");
    const url = new URL(normalized);
    requireCondition(
        (url.protocol === "https:" || url.protocol === "http:") && url.username === "" && url.password === "",
        "Repository identity must be a public HTTP(S) URL",
        "provenance",
    );
    url.search = "";
    url.hash = "";
    return url.href.replace(/\/$/u, "");
}
