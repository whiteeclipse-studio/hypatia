/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { SaxesParser } from "saxes";
import { requireCondition } from "../errors.ts";

const allowedTags = new Set([
    "svg",
    "g",
    "defs",
    "title",
    "desc",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "text",
    "tspan",
    "linearGradient",
    "radialGradient",
    "stop",
    "clipPath",
    "mask",
]);
const allowedAttributes = new Set([
    "id",
    "xmlns",
    "viewBox",
    "width",
    "height",
    "x",
    "y",
    "x1",
    "x2",
    "y1",
    "y2",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "d",
    "points",
    "fill",
    "fill-opacity",
    "fill-rule",
    "stroke",
    "stroke-width",
    "stroke-opacity",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-dasharray",
    "stroke-dashoffset",
    "opacity",
    "transform",
    "preserveAspectRatio",
    "gradientUnits",
    "gradientTransform",
    "offset",
    "stop-color",
    "stop-opacity",
    "clip-path",
    "clip-rule",
    "mask",
    "font-family",
    "font-size",
    "font-weight",
    "text-anchor",
    "dominant-baseline",
    "dx",
    "dy",
]);
const maxDepth = 64;

/**
 * Escapes text for a literal XML attribute or text node.
 *
 * @param value - Original text.
 * @returns Escaped XML text.
 */
function escapeXml(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * Retains only literal presentation attributes and local paint references.
 *
 * @param name - Attribute name.
 * @param value - Parsed XML value.
 * @returns A safely serialized attribute, or an empty string when unsupported.
 * @throws {DocumentationError} For external resources or invalid namespace declarations.
 */
function safeAttribute(name: string, value: string): string {
    if (!allowedAttributes.has(name)) {
        return "";
    }
    requireCondition(
        !/url\s*\(/iu.test(value) || /^url\(#[a-zA-Z_][\w.-]*\)$/u.test(value),
        "SVG external paint resource",
        "unsafe-asset",
    );
    requireCondition(
        name !== "xmlns" || value === "http://www.w3.org/2000/svg",
        "Invalid SVG namespace",
        "unsafe-asset",
    );
    return ` ${name}="${escapeXml(value)}"`;
}

/**
 * Parses XML and reconstructs a static SVG without scripts, CSS, animation, or external resources.
 *
 * @param text - Untrusted SVG source.
 * @returns Sanitized SVG bytes.
 * @throws {Error} For malformed XML, forbidden declarations, or unsafe resources.
 */
export function sanitizeSvg(text: string): Uint8Array {
    const parser = new SaxesParser({ xmlns: false });
    const output: string[] = [];
    const stack: boolean[] = [];
    const roots: string[] = [];
    parser.on("doctype", rejectDeclaration);
    parser.on("processinginstruction", rejectDeclaration);
    parser.on("opentag", function open(tag): void {
        requireCondition(stack.length < maxDepth, "SVG nesting limit exceeded", "limits");
        if (roots.length === 0) {
            requireCondition(tag.name === "svg", "SVG root element required", "unsafe-asset");
            roots.push(tag.name);
        }
        const included = !stack.includes(false) && allowedTags.has(tag.name);
        stack.push(included);
        if (included) {
            const attributes = Object.entries(tag.attributes)
                .map(function attribute([name, value]): string {
                    return safeAttribute(name, value);
                })
                .join("");
            output.push(`<${tag.name}${attributes}>`);
        }
    });
    parser.on("closetag", function close(tag): void {
        if (stack.pop() === true) {
            output.push(`</${tag.name}>`);
        }
    });
    parser.on("text", function textNode(value): void {
        if (!stack.includes(false)) {
            output.push(escapeXml(value));
        }
    });
    parser.write(text).close();
    requireCondition(roots.length > 0 && stack.length === 0, "Incomplete SVG", "unsafe-asset");
    return new TextEncoder().encode(output.join(""));
}

/**
 * Forbids entity declarations and processing instructions.
 *
 * @throws {Error} Always, because declarations can enable active or external content.
 */
function rejectDeclaration(): never {
    throw new Error("SVG declarations and processing instructions are not supported");
}
