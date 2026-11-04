/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Optional intrinsic pixel dimensions when Bun can parse the image. */
export interface ImageDimensions {
    /** Encoded width in pixels, before any display-orientation transform. */
    readonly width?: number;
    /** Encoded height in pixels, before any display-orientation transform. */
    readonly height?: number;
}

/**
 * Reads image metadata from the exact source bytes without decoding pixels or reopening the file.
 * Unsupported formats (such as SVG) and rejected images leave optional dimensions absent.
 *
 * @param bytes Original versioned file bytes.
 * @returns Positive encoded dimensions when Bun can read the image header.
 */
export async function imageDimensions(bytes: Buffer): Promise<ImageDimensions> {
    try {
        const { width, height } = await new Bun.Image(bytes, { autoOrient: false }).metadata();
        if (width > 0 && height > 0) {
            return { width, height };
        }
    } catch {
        // Dimension extraction is best effort; preserve the original asset when Bun rejects it.
    }
    return {};
}
