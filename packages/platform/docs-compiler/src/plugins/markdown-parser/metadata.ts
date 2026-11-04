/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Element, Nodes, Root, RootContent } from "hast";
import {
    type DocumentArtifactMetadata,
    documentArtifactMetadataSchema,
    type DocumentRevision,
    documentRevisionSchema,
    type TranslationArtifactMetadata,
    translationArtifactMetadataSchema,
} from "../../types/index.js";
import type { MarkdownParserConfiguration } from "./configuration.js";


/**
 * Reads plain text from formatted HAST, excluding comments and using image alternatives.
 *
 * @param node Tree or descendant.
 * @returns Concatenated textual contents.
 */
export function text(node: Nodes): string {
    if (node.type === "text") {
        return node.value;
    }
    if (node.type === "element" && node.tagName === "img") {
        return node.properties.alt ?? "";
    }
    if ("children" in node) {
        return node.children.map(text).join("");
    }
    return "";
}

/**
 * Extracts top-level metadata sections, keeping nested sections within their parent.
 *
 * @param tree Parsed HAST, owned by this transformation.
 * @param names Recognized section headings.
 * @returns The last matching section's contents without its heading; all matches are removed.
 */
function takeSection(tree: Root, names: readonly string[]): Root {
    const matches = new Set(names.map(name => name.trim().toLowerCase()));
    let section: Root | undefined;
    for (let index = 0; index < tree.children.length; index++) {
        const node = tree.children[index];
        if (!isHeading(node) || !matches.has(text(node).trim().toLowerCase())) {
            continue;
        }
        if (section !== undefined) {
            // throw new TypeError(`Duplicate metadata section: ${text(node)}.`);
        }
        let end = index + 1;
        while (end < tree.children.length) {
            const next = tree.children[end];
            if (isHeading(next) && next.tagName <= node.tagName) {
                break;
            }
            end++;
        }
        section = { type: "root", children: tree.children.splice(index, end - index).slice(1) };
        index--;
    }
    return section ?? { type: "root", children: [] };
}

/**
 * Identifies an HTML heading.
 *
 * @param node Top-level content.
 * @returns Whether the node is an h1 through h6 element.
 */
function isHeading(node: RootContent | undefined): node is Element {
    return node?.type === "element" && /^h[1-6]$/.test(node.tagName);
}

/**
 * Reads ordered revision rows, preserving formatted author and description cells.
 *
 * @param section Extracted revision section.
 * @returns Validated sequential revisions.
 * @throws {TypeError} If a present section lacks a single four-column table or has invalid rows.
 */
function readRevisions(section: Root): readonly DocumentRevision[] {
    const content = section.children.filter(node => node.type !== "text" || node.value.trim() !== "");
    if (content.length === 0) {
        return [];
    }
    const table = content[0];
    if (content.length !== 1 || table?.type !== "element" || table.tagName !== "table") {
        throw new TypeError("Revisions must contain a single four-column table.");
    }
    const rows = table.children.flatMap(section =>
        section.type === "element" && (section.tagName === "thead" || section.tagName === "tbody")
            ? section.children.filter((row): row is Element => row.type === "element" && row.tagName === "tr")
            : [],
    );
    const header = rows.shift();
    const columnCount = 4;
    if (header === undefined || cells(header).length !== columnCount || rows.length === 0) {
        throw new TypeError("Revisions require a four-column header and at least one entry.");
    }
    return rows.map((row, index) => {
        const columns = cells(row);
        const [revision, date, author, description] = columns;
        if (
            columns.length !== columnCount ||
            revision === undefined ||
            date === undefined ||
            author === undefined ||
            description === undefined
        ) {
            throw new TypeError("Revision rows require four cells.");
        }
        if (text(revision).trim() !== String(index + 1)) {
            throw new TypeError("Revision numbers must start at 1 and increase by one.");
        }
        return documentRevisionSchema.parse({
            revision: index + 1,
            date: text(date).trim(),
            author: { type: "root", children: author.children },
            description: { type: "root", children: description.children },
        });
    });
}

/**
 * Selects table cells without inter-element whitespace.
 *
 * @param row Table row.
 * @returns Header and data cells in source order.
 */
function cells(row: Element): Element[] {
    return row.children.filter(
        (node): node is Element => node.type === "element" && (node.tagName === "th" || node.tagName === "td"),
    );
}

/**
 * Extracts article metadata without resolving canonical sources or authored destinations.
 *
 * @param tree Owned HAST; metadata sections are removed in place.
 * @param frontmatter Parsed YAML mapping.
 * @param path Logical artifact path, also used for missing IDs and titles.
 * @param configuration Localized metadata headings.
 * @returns Discriminated artifact type and validated metadata.
 * @throws {TypeError} If sections, revisions, or translation metadata are invalid.
 */
export function extractMetadata(
    tree: Root,
    frontmatter: Record<string, unknown>,
    path: string,
    configuration: MarkdownParserConfiguration,
):
    | { type: "document"; metadata: DocumentArtifactMetadata }
    | { type: "translation"; metadata: TranslationArtifactMetadata } {
        const title = tree.children.find(node => node.type === "element" && node.tagName === "h1");
        const copyrightAndLicence = takeSection(tree, [
            "Copyright and licence",
            ...(configuration.headings?.copyrightAndLicence ?? []),
        ]);
        const revisions = readRevisions(takeSection(tree, ["Revisions", ...(configuration.headings?.revisions ?? [])]));
        const common = {
            ...frontmatter,
            id: frontmatter["id"] ?? path,
            title: title === undefined ? path : text(title).trim(),
            copyrightAndLicence,
            revisions,
        };

        if (Object.hasOwn(frontmatter, "source_id")) {
            const metadata = translationArtifactMetadataSchema.parse({
                ...common,
                sourceId: frontmatter["source_id"],
                locale: translationLocale(frontmatter, path),
            });
            return { type: "translation" as const, metadata };
        }

        let navigable = Boolean(frontmatter["navigable"] ?? true);
        if (path.includes("agents.md")) {
            navigable = false;
        } else if (path.includes("licence") || path.includes("license")) {
            navigable = false;
        }

        const metadata = documentArtifactMetadataSchema.parse({
            ...common,
            navigable,
        });
        return { type: "document" as const, metadata };
    }

/**
 * Canonicalizes a declared translation locale or its filename suffix without source lookup.
 *
 * @param frontmatter Parsed YAML mapping.
 * @param path Logical artifact path.
 * @returns Canonical BCP 47 language tag.
 * @throws {TypeError} If no locale is available.
 * @throws {RangeError} If the locale is invalid.
 */
function translationLocale(frontmatter: Record<string, unknown>, path: string): string {
    const suffix = /\.(?<locale>[^./]+)\.md$/i.exec(path)?.groups?.["locale"];
    const locale = frontmatter["locale"] ?? suffix;
    if (typeof locale !== "string") {
        throw new TypeError("Translations require a locale or a <filename>.<language>.md path.");
    }
    const canonical = Intl.getCanonicalLocales(locale)[0];
    if (canonical === undefined) {
        throw new TypeError("Translations require a nonempty locale.");
    }
    return canonical;
}
