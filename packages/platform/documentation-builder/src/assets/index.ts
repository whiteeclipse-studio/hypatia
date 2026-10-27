/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { fileTypeFromBuffer } from "file-type";
import { imageSize } from "image-size";
import { requireCondition } from "../errors.ts";
import { sanitizeSvg } from "./svg.ts";

const rasterTypes = new Map([
    ["png", "image/png"],
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["gif", "image/gif"],
    ["webp", "image/webp"],
]);
const textTypes = new Map([
    ["json", "application/json"],
    ["yaml", "text/yaml"],
    ["yml", "text/yaml"],
    ["txt", "text/plain"],
]);
const maxPixels = 50_000_000;

/** Validated supporting asset, including any necessary content sanitation. */
export interface ValidatedAsset {
    content: Uint8Array;
    mediaType: string;
}

/**
 * Requires valid UTF-8 rather than silently replacing invalid text bytes.
 *
 * @param bytes - Untrusted textual content.
 * @returns Decoded text.
 * @throws {TypeError} When the input is not valid UTF-8.
 */
export function decodeText(bytes: Uint8Array): string {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/**
 * Checks asset content and reconstructs active formats into safe representations.
 * YAML remains inert UTF-8 in portable readers; Bun validates its syntax in source builds.
 *
 * @param path - Canonical asset path.
 * @param bytes - Untrusted content.
 * @returns Validated content and its authoritative media type.
 * @rejects For unsupported formats, content mismatches, or active content.
 */
export async function validateAsset(path: string, bytes: Uint8Array): Promise<ValidatedAsset> {
    const extension = path.split(".").pop()?.toLowerCase() ?? "";
    const mediaType = textTypes.get(extension);
    if (mediaType !== undefined) {
        validateText(extension, bytes);
        return { content: bytes, mediaType };
    }
    if (extension === "svg") {
        return { content: sanitizeSvg(decodeText(bytes)), mediaType: "image/svg+xml" };
    }
    if (extension === "pdf") {
        const { validatePdf } = await import("./pdf.ts");
        await validatePdf(bytes);
        return { content: bytes, mediaType: "application/pdf" };
    }
    return validateRaster(extension, bytes);
}

/**
 * Checks textual content without ever evaluating it.
 *
 * @param extension - Recognized textual extension.
 * @param bytes - Untrusted text bytes.
 * @throws {Error} For malformed UTF-8, JSON, or binary content masquerading as text.
 */
function validateText(extension: string, bytes: Uint8Array): void {
    const text = decodeText(bytes);
    requireCondition(!text.includes("\0"), "NUL byte in textual asset", "unsafe-asset");
    if (extension === "json") {
        JSON.parse(text);
    }
}

/**
 * Matches raster signatures and checks bounded, positive dimensions.
 *
 * @param extension - Claimed filename extension.
 * @param bytes - Untrusted image bytes.
 * @returns A content-identified raster asset.
 * @rejects For unsupported, malformed, mismatched, or oversized images.
 */
async function validateRaster(extension: string, bytes: Uint8Array): Promise<ValidatedAsset> {
    const expected = rasterTypes.get(extension);
    requireCondition(expected !== undefined, `Unsupported asset format: ${extension}`, "unsafe-asset");
    const identified = await fileTypeFromBuffer(bytes);
    requireCondition(identified?.mime === expected, `Asset content does not match .${extension}`, "unsafe-asset");
    const size = imageSize(bytes);
    requireCondition(
        size.width > 0 && size.height > 0 && size.width * size.height <= maxPixels,
        "Image dimensions exceed limits",
        "limits",
    );
    return { content: bytes, mediaType: expected };
}
