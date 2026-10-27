/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { loadArtifact, validateArtifact } from "../artifact/index.ts";
import { readStream } from "../artifact/bytes.ts";
import { resolveLimits } from "../limits.ts";
import { requireCondition } from "../errors.ts";
import type { DocumentationArtifact, ProcessingLimits } from "../types.ts";

/** Provider-independent download options; authorization, when needed, is supplied by the consumer. */
export interface DownloadOptions {
    limits?: Partial<ProcessingLimits>;
    signal?: AbortSignal;
    fetch?: typeof fetch;
}

/** Download outcome retains the usable baseline and makes fallback visible to the consumer. */
export interface DownloadOutcome {
    artifact: DocumentationArtifact;
    usedFallback: boolean;
    error?: unknown;
}

/**
 * Downloads and validates a complete artifact before returning it for rendering or caching.
 *
 * @param url - User-readable HTTP(S) artifact URL, relative to the website when appropriate.
 * @param options - Resource, cancellation, and fetch integration options.
 * @returns A validated artifact; no partially downloaded state is exposed.
 * @rejects For HTTP, download, cancellation, validation, or resource failures.
 */
export async function downloadArtifact(url: string, options: DownloadOptions = {}): Promise<DocumentationArtifact> {
    requireCondition(
        /^(?:https?:\/\/|\/(?!\/))/u.test(url),
        "Artifact URL must be HTTP(S) or origin-relative",
        "download",
    );
    const limits = resolveLimits(options.limits);
    const timeout = AbortSignal.timeout(limits.timeoutMs);
    const signal = options.signal === undefined ? timeout : AbortSignal.any([timeout, options.signal]);
    const response = await (options.fetch ?? fetch)(url, { signal });
    requireCondition(
        response.ok && response.body !== null,
        `Artifact download failed: HTTP ${response.status}`,
        "download",
    );
    const declared = response.headers.get("content-length");
    requireCondition(
        declared === null || Number(declared) <= limits.maxCompressedBytes,
        "Download exceeds compressed limit",
        "limits",
    );
    const bytes = await readStream(response.body, limits.maxCompressedBytes);
    return loadArtifact(bytes, limits);
}

/**
 * Keeps a validated build-time version usable when a newer artifact cannot be downloaded.
 *
 * @param url - Desired remote artifact.
 * @param fallback - Build-time artifact, revalidated before use.
 * @param options - Download and resource options.
 * @returns The new artifact, or the baseline with its original download failure.
 * @rejects When the supplied baseline itself is invalid.
 */
export async function downloadWithFallback(
    url: string,
    fallback: DocumentationArtifact,
    options: DownloadOptions = {},
): Promise<DownloadOutcome> {
    const baseline = await validateArtifact(fallback.files, options.limits);
    try {
        return { artifact: await downloadArtifact(url, options), usedFallback: false };
    } catch (error) {
        return { artifact: baseline, usedFallback: true, error };
    }
}
