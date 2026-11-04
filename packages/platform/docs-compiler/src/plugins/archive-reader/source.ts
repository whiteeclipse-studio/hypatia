/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Input } from "../../types";


/**
 * Recognizes HTTP(S) archive locations without fetching during resolution.
 *
 * @param input Repository location supplied to the compiler.
 * @returns Canonical URL, or undefined for another source kind.
 * @throws {TypeError} If an archive URL embeds credentials or a fragment.
 */
export function resolveSource(input: Input): string | undefined {
    if (!URL.canParse(input)) {
        return undefined;
    }
    const url = new URL(input);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || !isArchiveName(url.pathname)) {
        return undefined;
    }
    if (url.username !== "" || url.password !== "" || url.hash !== "") {
        throw new TypeError("Archive URLs must not contain credentials or fragments.");
    }
    return url.href;
}

/**
 * Recognizes the two filename suffixes used for gzip-compressed TAR inputs.
 *
 * @param path URL pathname or local filename.
 * @returns Whether this is an archive input rather than another plugin's source.
 */
export function isArchiveName(path: string): boolean {
    return path.endsWith(".tar.gz") || path.endsWith(".tgz");
}

/**
 * Opens a remote archive with compiler cancellation and HTTP failure reporting.
 *
 * @param source Resolved HTTP(S) source.
 * @param signal Build cancellation passed through to fetch.
 * @returns Response byte stream; the caller owns bounded consumption and cancellation.
 * @rejects If HTTP fails, the response has no body, or fetching is cancelled.
 */
export async function openSource(source: string, signal: AbortSignal): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(source, { signal });
    if (!response.ok || response.body === null) {
        await response.body?.cancel();
        throw new Error(`Unable to read archive ${source}: HTTP ${response.status}.`);
    }
    return response.body;
}
