/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { AssetArtifactMetadata } from "../../../types/index.js";
import { imageDimensions } from "./image.js";
import { resolveMimeType } from "./mime.js";
import { readRiffChunks } from "./riff.js";


/** Optional fields resolved from supported binary headers. */
interface FilesystemAssetMetadata extends AssetArtifactMetadata {
    /** Encoded image width in pixels when a supported header provides it. */
    readonly width?: number;
    /** Encoded image height in pixels when a supported header provides it. */
    readonly height?: number;
    /** Uncompressed WAV duration in seconds when its format and data chunks are available. */
    readonly duration?: number;
}

/**
 * Resolves MIME and byte size, adding supported image dimensions or PCM/float WAV duration.
 * PDF pageCount needs a PDF object parser (including compressed object streams).
 * Video dimensions/duration and other audio durations need container/codec readers unavailable here.
 * These optional fields are omitted, never guessed from file size or regex matches.
 *
 * @param file Source filename used for MIME resolution.
 * @param bytes Exact versioned contents stored in the compiler cache.
 * @returns Metadata derived without subprocesses, dependencies, or a second disk read.
 */
export async function resolveAssetMetadata(file: string, bytes: Buffer): Promise<FilesystemAssetMetadata> {
    const mimeType = resolveMimeType(file);
    const metadata = { mimeType, size: bytes.length };
    if (mimeType.startsWith("image/")) {
        return { ...metadata, ...(await imageDimensions(bytes)) };
    }
    if (mimeType === "audio/wav" || mimeType === "audio/x-wav") {
        const duration = wavDuration(bytes);
        if (duration !== undefined) {
            return { ...metadata, duration };
        }
    }
    return metadata;
}

/**
 * Reads RIFF chunks with padding and derives duration only for uncompressed PCM or IEEE float audio.
 * Compressed WAV and extensible format descriptors require additional format-specific parsing.
 *
 * @param bytes Original file bytes.
 * @returns Duration in seconds when a complete supported WAV description is present.
 */
function wavDuration(bytes: Buffer): number | undefined {
    const minimumFormatSize = 16;
    const byteRateOffset = 8;
    const floatFormat = 3;
    const chunks = readRiffChunks(bytes, "WAVE");
    const format = chunks.find(chunk => chunk.id === "fmt ")?.data;
    const data = chunks.find(chunk => chunk.id === "data")?.data;
    if (format === undefined || format.length < minimumFormatSize || data === undefined) {
        return undefined;
    }
    const encoding = format.readUInt16LE(0);
    const byteRate = format.readUInt32LE(byteRateOffset);
    if ((encoding === 1 || encoding === floatFormat) && byteRate > 0) {
        return data.length / byteRate;
    }
    return undefined;
}
