/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { requireCondition } from "../errors.ts";

/**
 * Joins bounded byte chunks without Node Buffer dependencies.
 *
 * @param chunks - Chunks in order.
 * @returns Their concatenated bytes.
 */
export function joinBytes(chunks: readonly Uint8Array[]): Uint8Array {
    const length = chunks.reduce(function sum(total, chunk): number {
        return total + chunk.byteLength;
    }, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return result;
}

/**
 * Reads a stream while enforcing a byte ceiling before concatenation.
 *
 * @param stream - Input stream.
 * @param maximum - Maximum accepted size.
 * @returns Complete bounded bytes.
 * @rejects For stream failures or oversized content.
 */
export async function readStream(stream: ReadableStream<Uint8Array>, maximum: number): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        let next = await reader.read();
        while (!next.done) {
            size += next.value.byteLength;
            requireCondition(size <= maximum, "Stream size limit exceeded", "limits");
            chunks.push(next.value);
            next = await reader.read();
        }
    } finally {
        await reader.cancel();
        reader.releaseLock();
    }
    return joinBytes(chunks);
}
