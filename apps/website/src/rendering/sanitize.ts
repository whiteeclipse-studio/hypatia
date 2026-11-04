/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { defaultSchema, sanitize } from "hast-util-sanitize";
import type { Element, Root } from "hast";


/**
 * One policy for article content, notices and revision descriptions.
 *
 * @param tree The tree value.
 * @returns The prepared result.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export function safeTree(tree: Root): Root {
    const clean = sanitize(tree, {
        ...defaultSchema,
        clobberPrefix: "",
        attributes: {
            ...defaultSchema.attributes,
            "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"],
            div: ["className"],
            blockquote: ["className"],
        },
    });
    if (clean.type !== "root") {
        throw new Error("Expected sanitized HAST root.");
    }
    const slugs = new Map<string, number>();
    /**
     * Collects the text of a sanitized heading.
     *
     * @param node The node value.
     * @returns The prepared result.
     */
    function text(node: Root | Element): string {
        return node.children
            .map(child => {
                if (child.type === "element") {
                    return text(child);
                }
                if (child.type === "text") {
                    return child.value;
                }
                return "";
            })
            .join("");
    }
    /**
     * Visits document elements without interpreting document-supplied code.
     *
     * @param node The node value.
     */
    function visit(node: Root | Element): void {
        for (const child of node.children) {
            if (child.type !== "element") {
                continue;
            }
            for (const property of ["id", "name"]) {
                const value = child.properties[property];
                if (typeof value === "string" && !value.startsWith("doc-")) {
                    child.properties[property] = `doc-${value}`;
                }
            }
            if (/^h[1-6]$/.test(child.tagName)) {
                const original = child.properties.id;
                const label = text(child)
                    .toLowerCase()
                    .replace(/[^\p{L}\p{N} _-]/gu, "")
                    .replace(/ /g, "-");
                const slug = label === "" ? "section" : label;
                const count = slugs.get(slug) ?? 0;
                slugs.set(slug, count + 1);
                const id = typeof original === "string" ? original : slug + (count === 0 ? "" : `-${count}`);
                child.properties.id = id.startsWith("doc-") ? id : `doc-${id}`;
            }
            visit(child);
        }
    }
    visit(clean);
    return clean;
}

/**
 * Passive formats only; SVG/HTML/PDF and unknown binary content are not embedded.
 *
 * @param blob The blob value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
export async function passiveAsset(blob: Blob): Promise<Blob | undefined> {
    const signatureLength = 16;
    const hexadecimal = 16;
    const digits = 2;
    const webpEnd = 24;
    const bytes = new Uint8Array(await blob.slice(0, signatureLength).arrayBuffer());
    const signature = [...bytes].map(value => value.toString(hexadecimal).padStart(digits, "0")).join("");
    let type: string | undefined;
    if (signature.startsWith("89504e470d0a1a0a")) {
        type = "image/png";
    }
    if (signature.startsWith("ffd8ff")) {
        type = "image/jpeg";
    }
    if (signature.startsWith("474946383761") || signature.startsWith("474946383961")) {
        type = "image/gif";
    }
    if (signature.startsWith("52494646") && signature.slice(signatureLength, webpEnd) === "57454250") {
        type = "image/webp";
    }
    if (type === undefined) {
        return undefined;
    }
    return new Blob([blob], { type });
}
