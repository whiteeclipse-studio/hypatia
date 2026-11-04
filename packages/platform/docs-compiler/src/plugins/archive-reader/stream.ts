/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Collects a byte stream within a finite bound and cancels it on failure or abort.
 *
 * @param stream Input bytes, possibly produced by a decompressor.
 * @param maximum Maximum bytes retained before rejection.
 * @param signal Build cancellation, including cancellation during a pending read.
 * @returns Collected bytes without interpreting their content type.
 * @rejects If input exceeds its limit, streaming fails, or the build is cancelled.
 */
export async function readBoundedStream(
    stream: ReadableStream<Uint8Array>,
    maximum: number,
    signal: AbortSignal,
): Promise<Blob> {
    const reader = stream.getReader();
    const chunks: BlobPart[] = [];
    let size = 0;
    /** Cancels an admitted stream read when compilation stops. */
    const abort = () => {
        void reader.cancel(signal.reason).catch(() => undefined);
    };
    signal.addEventListener("abort", abort, { once: true });
    try {
        signal.throwIfAborted();
        for (;;) {
            const result = await reader.read();
            signal.throwIfAborted();
            if (result.done) {
                return new Blob(chunks);
            }
            size += result.value.byteLength;
            if (size > maximum) {
                throw new RangeError(`Archive stream exceeds its ${maximum}-byte limit.`);
            }
            chunks.push(new Uint8Array(result.value));
        }
    } finally {
        signal.removeEventListener("abort", abort);
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
    }
}
