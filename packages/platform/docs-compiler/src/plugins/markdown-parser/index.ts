/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import { type CompilerPlugin, isHastRoot } from "../../types/index.js";
import { copyMetadata } from "../../compiler/snapshot/metadata.js";
import type { MarkdownParserConfiguration } from "./configuration.js";
import { createParser } from "./parse.js";
import { extractMetadata } from "./metadata.js";


export type { MarkdownParserConfiguration };

/**
 * Converts text/markdown assets to cache-backed document or translation artifacts.
 * Link resolution, canonical-source lookup, and publication sanitization belong to consumers.
 *
 * @param configuration Optional syntax extensions and localized metadata headings.
 * @returns An exploratory Markdown transform under draft RFC-0005.
 */
export function markdownParser(configuration: MarkdownParserConfiguration = {}): CompilerPlugin {
    const options = copyMetadata(configuration);
    let parser: ReturnType<typeof createParser> | undefined;
    return {
        name: "markdown-parser",
        async transform(value) {
            if (
                !("read" in value) ||
                value.type !== "asset" ||
                value.metadata.mimeType.split(";", 1)[0]?.trim().toLowerCase() !== "text/markdown"
            ) {
                return undefined;
            }
            this.signal.throwIfAborted();
            parser ??= createParser(options);
            const parse = await parser;
            const { tree, frontmatter } = await parse(await (await value.read()).text());
            this.signal.throwIfAborted();
            const description = extractMetadata(tree, frontmatter, value.path, options);
            const key = crypto.randomUUID();
            await this.cache.write(key, new Blob([JSON.stringify(tree)], { type: "application/json" }));
            this.signal.throwIfAborted();
            const payload = Object.freeze({ key, decode: decodeTree });
            const cache = this.cache;
            /**
             * Reads an independent tree from the immutable compiler payload.
             *
             * @returns Decoded article HAST.
             * @rejects If storage is unavailable or malformed.
             */
            const read = async () => {
                const contents = await cache.read(key);
                if (contents === undefined) {
                    throw new Error(`Markdown payload ${key} is unavailable.`);
                }
                return decodeTree(contents);
            };
            if (description.type === "translation") {
                return Object.freeze({
                    path: value.path,
                    type: "translation",
                    metadata: copyMetadata(description.metadata),
                    payload,
                    read,
                });
            }
            return Object.freeze({
                path: value.path,
                type: "document",
                metadata: copyMetadata(description.metadata),
                payload,
                read,
            });
        },
    };
}

/**
 * Decodes an independent HAST value without retaining build resources.
 *
 * @param contents Cached JSON payload.
 * @returns A validated HAST root.
 * @rejects If the payload is malformed.
 */
async function decodeTree(contents: Blob): Promise<Root> {
    const tree: unknown = JSON.parse(await contents.text());
    if (!isHastRoot(tree)) {
        throw new TypeError("Invalid cached Markdown HAST.");
    }
    return tree;
}
