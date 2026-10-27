/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { DocumentationError, requireCondition } from "../errors.ts";
import { defaultLimits, resolveLimits, checkFileLimits } from "../limits.ts";
import type {
    DocumentationArtifact,
    DocumentationManifest,
    DocumentationPage,
    NavigationEntry,
    ProcessingLimits,
} from "../types.ts";
import { runTask } from "../workers/task.ts";
import { renderPage, type RenderOptions, type RenderedPage } from "./render.ts";

export type {
    DocumentationArtifact,
    DocumentationManifest,
    DocumentationPage,
    NavigationEntry,
    ProcessingLimits,
    RenderOptions,
    RenderedPage,
};
export { DocumentationError, defaultLimits, renderPage };

/**
 * Unpacks and validates TAR.GZ bytes in a terminable worker, never extracting to disk.
 *
 * @param bytes - Untrusted compressed artifact.
 * @param options - Optional processing limits.
 * @returns A validated artifact suitable for rendering or admitting to a cache.
 * @rejects For malformed archives, unsafe content, worker failures, or exceeded limits.
 */
export async function loadArtifact(
    bytes: Uint8Array,
    options: Partial<ProcessingLimits> = {},
): Promise<DocumentationArtifact> {
    const limits = resolveLimits(options);
    requireCondition(bytes.byteLength <= limits.maxCompressedBytes, "Compressed artifact exceeds limit", "limits");
    const worker = new Worker(new URL("../workers/artifact.worker.ts", import.meta.url), { type: "module" });
    const result = await runTask(worker, { kind: "load", bytes, limits });
    requireCondition(result.kind === "artifact", "Unexpected artifact worker reply");
    return result.artifact;
}

/**
 * Revalidates an in-memory file collection using the same checks as archive imports.
 *
 * @param files - Untrusted expanded archive files.
 * @param options - Optional processing limits.
 * @returns A fresh, sanitized artifact.
 * @rejects For invalid manifests, files, media types, or worker failures.
 */
export async function validateArtifact(
    files: Map<string, Uint8Array>,
    options: Partial<ProcessingLimits> = {},
): Promise<DocumentationArtifact> {
    const limits = resolveLimits(options);
    checkFileLimits(files.values(), limits);
    const worker = new Worker(new URL("../workers/artifact.worker.ts", import.meta.url), { type: "module" });
    const result = await runTask(worker, { kind: "validate", files, limits });
    requireCondition(result.kind === "artifact", "Unexpected artifact worker reply");
    return result.artifact;
}

/**
 * Validates an artifact again and serializes it deterministically as TAR.GZ.
 *
 * @param artifact - In-memory documentation artifact.
 * @param options - Optional processing limits.
 * @returns The complete compressed archive.
 * @rejects For invalid content, serialization failures, or exceeded limits.
 */
export async function packArtifact(
    artifact: DocumentationArtifact,
    options: Partial<ProcessingLimits> = {},
): Promise<Uint8Array> {
    const limits = resolveLimits(options);
    checkFileLimits(artifact.files.values(), limits);
    const worker = new Worker(new URL("../workers/artifact.worker.ts", import.meta.url), { type: "module" });
    const result = await runTask(worker, { kind: "pack", artifact, limits });
    requireCondition(result.kind === "archive", "Unexpected archive worker reply");
    return result.bytes;
}
