/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import type { MarkdownParserConfiguration } from "./configuration.js";


/**
 * Creates one reusable processor; optional peer dependencies are loaded only when enabled.
 *
 * @param configuration Captured extension flags.
 * @returns A parser producing HAST and inert front matter without resolving links.
 * @rejects If an enabled optional extension cannot be imported.
 */
export async function createParser(configuration: MarkdownParserConfiguration) {
    const processor = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm);
    if (configuration.wikilinks === true) {
        const { default: wikiLink } = await import("remark-wiki-link");
        processor.use(wikiLink, {
            aliasDivider: "|",
            pageResolver: (target: string) => [target],
            hrefTemplate: (target: string) => target,
            wikiLinkClassName: "wikilink",
            newClassName: "",
        });
    }

    if (configuration.callouts === true) {
        const { default: callout } = await import("@r4ai/remark-callout");
        processor.use(callout);
    }

    const bridge = processor.use(remarkRehype);
    bridge.freeze();

    return async (source: string): Promise<{ tree: Root; frontmatter: Record<string, unknown> }> => {
        const markdown = bridge.parse(source);
        let frontmatter: Record<string, unknown> = {};
        const first = markdown.children[0];
        if (first?.type === "yaml") {
            const value: unknown = Bun.YAML.parse(first.value);
            if (typeof value !== "object" || value === null || Array.isArray(value)) {
                throw new TypeError("Markdown front matter must be a mapping.");
            }

            frontmatter = Object.fromEntries(Object.entries(value));
        }
        return { tree: await bridge.run(markdown), frontmatter };
    };
}
