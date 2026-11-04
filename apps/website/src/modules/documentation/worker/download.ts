/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { DEFAULT_ARCHIVE_READER_CONFIGURATION } from "@whiteeclipse/docs-compiler/packages/archive-reader";
import type { ArchiveRecord } from "../storage/archives";
import { httpStatus, timing } from "../../../shared/constants";


/**
 * Downloads bounded archive bytes using optional HTTP validators.
 *
 * @param url The url value.
 * @param record The record value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export async function download(
    url: string,
    record: ArchiveRecord | undefined,
): Promise<{ blob: Blob; record: ArchiveRecord } | undefined> {
    const headers = new Headers();
    if (record?.etag !== undefined) {
        headers.set("If-None-Match", record.etag);
    }
    if (record?.modified !== undefined) {
        headers.set("If-Modified-Since", record.modified);
    }
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(timing.timeout), cache: "no-cache" });
    if (response.status === httpStatus.unchanged && record !== undefined) {
        return undefined;
    }
    if (!response.ok || response.body === null) {
        throw new Error(`Archive request failed: HTTP ${response.status}`);
    }
    const blob = await boundedBody(response.body);
    const next: ArchiveRecord = {
        version: 1,
        archiveKey: `archive:${crypto.randomUUID()}`,
        checkedAt: Date.now(),
        retryAt: 0,
    };
    const etag = response.headers.get("etag");
    const modified = response.headers.get("last-modified");
    if (etag !== null) {
        next.etag = etag;
    }
    if (modified !== null) {
        next.modified = modified;
    }
    return { blob, record: next };
}

/**
 * Reads a download without allowing unbounded compressed input.
 *
 * @param body The body value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 * @throws {Error} If the supplied input or current state is invalid.
 */
async function boundedBody(body: ReadableStream<Uint8Array>): Promise<Blob> {
    const reader = body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let bytes = 0;
    try {
        for (;;) {
            const next = await reader.read();
            if (next.done) {
                break;
            }
            bytes += next.value.byteLength;
            if (bytes > DEFAULT_ARCHIVE_READER_CONFIGURATION.maxArchiveBytes) {
                throw new Error("Archive exceeds download limit.");
            }
            chunks.push(new Uint8Array(next.value));
        }
    } finally {
        await reader.cancel();
        reader.releaseLock();
    }
    return new Blob(chunks);
}
