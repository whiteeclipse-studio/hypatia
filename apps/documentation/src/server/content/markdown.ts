/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";

/** Markdown syntax shared by metadata discovery and article conversion. */
export const markdownParser = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).use(remarkGfm);
