/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { requireCondition } from "./errors.ts";
import type { ProcessingLimits } from "./types.ts";

/** Default limits; all sizes count bytes, including streamed expansion. */
export const defaultLimits: Readonly<ProcessingLimits> = Object.freeze({
    maxFiles: 10_000,
    maxCompressedBytes: 104_857_600,
    maxExpandedBytes: 262_144_000,
    maxFileBytes: 26_214_400,
    timeoutMs: 60_000,
});

/**
 * Resolves positive, finite integer resource ceilings.
 *
 * @param options - Optional overrides.
 * @returns Validated limits.
 * @throws {DocumentationError} When a limit is invalid.
 */
export function resolveLimits(options: Partial<ProcessingLimits> = {}): ProcessingLimits {
    const limits = { ...defaultLimits, ...options };
    for (const [name, value] of Object.entries(limits)) {
        requireCondition(Number.isSafeInteger(value) && value > 0, `Invalid processing limit: ${name}`, "limits");
    }
    return limits;
}

/**
 * Checks a virtual collection before further work or worker transfer.
 *
 * @param files - File contents to count.
 * @param limits - Resolved resource ceilings.
 * @throws {DocumentationError} When any file, count, or total exceeds its ceiling.
 */
export function checkFileLimits(files: Iterable<Uint8Array>, limits: ProcessingLimits): void {
    let count = 0;
    let total = 0;
    for (const content of files) {
        count += 1;
        total += content.byteLength;
        requireCondition(content.byteLength <= limits.maxFileBytes, "File size limit exceeded", "limits");
        requireCondition(
            count <= limits.maxFiles && total <= limits.maxExpandedBytes,
            "Artifact limits exceeded",
            "limits",
        );
    }
}
