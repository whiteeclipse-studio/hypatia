/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** One bounded RIFF chunk, excluding its header and padding. */
interface RiffChunk {
    /** Four-character chunk identity. */
    readonly id: string;
    /** Bounded view of chunk bytes, excluding padding. */
    readonly data: Buffer;
}

const riffHeaderSize = 12;
const chunkHeaderSize = 8;
const fourCCSize = 4;
const riffTypeOffset = 8;
const alignment = 2;

/**
 * Reads complete RIFF chunks; malformed or truncated containers yield no chunks.
 *
 * @param bytes Source bytes.
 * @param type Expected container form, such as WAVE.
 * @returns Bounded views of the source chunks.
 */
export function readRiffChunks(bytes: Buffer, type: string): readonly RiffChunk[] {
    if (
        bytes.length < riffHeaderSize ||
        bytes.toString("ascii", 0, fourCCSize) !== "RIFF" ||
        bytes.toString("ascii", riffTypeOffset, riffHeaderSize) !== type
    ) {
        return [];
    }
    const end = bytes.readUInt32LE(fourCCSize) + riffTypeOffset;
    if (end > bytes.length || end < riffHeaderSize) {
        return [];
    }
    const chunks: RiffChunk[] = [];
    let offset = riffHeaderSize;
    while (offset + chunkHeaderSize <= end) {
        const id = bytes.toString("ascii", offset, offset + fourCCSize);
        const length = bytes.readUInt32LE(offset + fourCCSize);
        offset += chunkHeaderSize;
        if (length > end - offset) {
            return [];
        }
        chunks.push({ id, data: bytes.subarray(offset, offset + length) });
        offset += length + (length % alignment);
    }
    if (offset !== end) {
        return [];
    }
    return chunks;
}
