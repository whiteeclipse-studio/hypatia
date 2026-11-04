/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Input } from "../../types/index.js";
import { isArchiveName, openSource as openRemoteSource, resolveSource as resolveRemoteSource } from "./source.js";


/**
 * Recognizes remote archives, local archive paths, and file URLs on server runtimes.
 *
 * @param input Configured repository input.
 * @returns Absolute source URL, or undefined for another plugin's source kind.
 * @throws {TypeError} If a local file URL contains a query or fragment.
 */
export function resolveSource(input: Input): string | undefined {
    if (!URL.canParse(input)) {
        return isArchiveName(String(input)) ? pathToFileURL(resolve(String(input))).href : undefined;
    }
    const url = new URL(input);
    if (url.protocol !== "file:" || !isArchiveName(url.pathname)) {
        return resolveRemoteSource(input);
    }
    if (url.search !== "" || url.hash !== "") {
        throw new TypeError("Local archive URLs must not contain queries or fragments.");
    }
    return pathToFileURL(fileURLToPath(url)).href;
}

/**
 * Opens local files as streams and delegates HTTP(S) requests to the web adapter.
 *
 * @param source Resolved source URL.
 * @param signal Compiler cancellation shared with filesystem or network reads.
 * @returns Stream consumed under the reader's compressed-byte limit.
 * @rejects If opening, fetching, or cancellation fails.
 */
export async function openSource(source: string, signal: AbortSignal): Promise<ReadableStream<Uint8Array>> {
    if (new URL(source).protocol === "file:") {
        return openFileStream(fileURLToPath(source), signal);
    }
    return openRemoteSource(source, signal);
}

/**
 * Adapts a bounded Node file stream to the same web stream interface used by fetch.
 *
 * @param path Absolute local archive filename.
 * @param signal Compiler cancellation forwarded to the file stream.
 * @returns Byte stream that closes the file on cancellation or completion.
 */
function openFileStream(path: string, signal: AbortSignal): ReadableStream<Uint8Array> {
    const stream = createReadStream(path, { signal });
    const iterator = stream[Symbol.asyncIterator]();
    return new ReadableStream<Uint8Array>({
        async pull(controller) {
            const result = await iterator.next();
            if (result.done === true) {
                controller.close();
                return;
            }
            const bytes: unknown = result.value;
            if (!(bytes instanceof Uint8Array)) {
                throw new TypeError("Expected binary archive file bytes.");
            }
            controller.enqueue(bytes);
        },
        async cancel() {
            await iterator.return?.();
        },
    });
}
