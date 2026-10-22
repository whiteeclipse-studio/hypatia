/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { extname } from "node:path";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { contentLimits, readContentFile } from "./files";

/** Restricts direct SVG navigation as well as image embedding to non-executable content. */
export const assetContentSecurityPolicy = "default-src 'none'; style-src 'none'; sandbox";

const imageTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
};

const svgAttributes = [
    "id",
    "x",
    "y",
    "x1",
    "y1",
    "x2",
    "y2",
    "width",
    "height",
    "viewBox",
    "preserveAspectRatio",
    "d",
    "points",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "fillOpacity",
    "fillRule",
    "strokeWidth",
    "strokeOpacity",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeDasharray",
    "opacity",
    "transform",
    "fontSize",
    "fontFamily",
    "fontWeight",
    "textAnchor",
    "dominantBaseline",
    "dx",
    "dy",
    "offset",
    "stopColor",
];

/**
 * Reads a supported source image and sanitizes SVG through an explicit, non-active allowlist.
 * Scripts, foreign objects, styles, events, external references, and embedded images are excluded.
 *
 * @param root - Configured docs root.
 * @param path - Inventoried image path relative to docs.
 * @returns Safe image bytes and their response content type.
 * @rejects If the asset is unsupported, unreadable, oversized, or cannot be sanitized.
 */
export async function loadAsset(root: string, path: string): Promise<{ bytes: Uint8Array; contentType: string }> {
    const extension = extname(path).toLowerCase();
    const contentType = imageTypes[extension];
    if (contentType === undefined) {
        throw new Error(`Unsupported documentation asset: ${path}`);
    }
    const bytes = await readContentFile(root, path, contentLimits.assetBytes);
    if (extension !== ".svg") {
        return { bytes, contentType };
    }
    const result = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize, {
            tagNames: [
                "svg",
                "g",
                "path",
                "rect",
                "circle",
                "ellipse",
                "line",
                "polyline",
                "polygon",
                "text",
                "tspan",
                "title",
                "desc",
            ],
            attributes: {
                "*": [
                    ...svgAttributes,
                    ["fill", /^(?:none|currentColor|#[a-f\d]{3,8}|[a-z]+|rgba?\([\d.,% ]+\))$/i],
                    ["stroke", /^(?:none|currentColor|#[a-f\d]{3,8}|[a-z]+|rgba?\([\d.,% ]+\))$/i],
                ],
                svg: [["xmlns", "http://www.w3.org/2000/svg"]],
            },
            strip: ["script", "style", "foreignObject", "iframe", "object", "image", "use"],
            clobber: ["id", "name"],
            clobberPrefix: "user-content-",
        })
        .use(rehypeStringify)
        .process(bytes.toString("utf8"));
    return { bytes: new TextEncoder().encode(String(result)), contentType };
}
