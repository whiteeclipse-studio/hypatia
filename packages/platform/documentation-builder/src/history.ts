/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { visit } from "unist-util-visit";
import type { Element, ElementContent, RootContent } from "hast";
import { parseHtml } from "./html.ts";
import { requireCondition } from "./errors.ts";

const revisionColumns = 4;

/**
 * Collects visible syntax-tree text without reading HTML as executable markup.
 *
 * @param node - An HTML syntax-tree node.
 * @returns Its descendant text.
 */
export function nodeText(node: RootContent | ElementContent): string {
    if (node.type === "text") {
        return node.value;
    }
    if (node.type === "element") {
        return node.children.map(nodeText).join("");
    }
    return "";
}

/**
 * Requires a complete sequential revision table and returns the document's own revision.
 *
 * @param html - Sanitized revision disclosure.
 * @returns The last revision number.
 * @throws {DocumentationError} For missing or malformed revision tables.
 */
export function documentRevision(html: string): number {
    const tables: Element[] = [];
    visit(parseHtml(html), "element", function table(node): void {
        if (node.tagName === "table") {
            tables.push(node);
        }
    });
    requireCondition(tables.length === 1, "Exactly one revision table is required", "metadata");
    const table = tables[0];
    requireCondition(table !== undefined, "Missing revision table", "metadata");
    const rows: string[][] = [];
    visit(table, "element", function row(node): void {
        if (node.tagName === "tr") {
            rows.push(node.children.filter(isCell).map(nodeText).map(trim));
        }
    });
    requireCondition(
        rows.shift()?.join("|") === "Revision|Date|Author|Description",
        "Invalid revision table columns",
        "metadata",
    );
    requireCondition(rows.length > 0, "Revision history is empty", "metadata");
    rows.forEach(validateRevision);
    return rows.length;
}

/**
 * Narrows a table row child to a header or data cell.
 *
 * @param node - Table row child.
 * @returns Whether the child is a table cell.
 */
function isCell(node: ElementContent): node is Element {
    return node.type === "element" && (node.tagName === "th" || node.tagName === "td");
}

/**
 * Trims a visible table-cell value.
 *
 * @param value - Cell text.
 * @returns Trimmed cell text.
 */
function trim(value: string): string {
    return value.trim();
}

/**
 * Requires one sequential, human-authored history entry.
 *
 * @param cells - Revision, date, author, and description.
 * @param index - Zero-based row number.
 * @throws {DocumentationError} For incomplete, nonsequential, or invalidly dated entries.
 */
function validateRevision(cells: string[], index: number): void {
    const [revision, date, author, description] = cells;
    requireCondition(
        cells.length === revisionColumns && revision === String(index + 1),
        "Revision numbers must be sequential from 1",
        "metadata",
    );
    requireCondition(date !== undefined && /^\d{4}-\d{2}-\d{2}$/u.test(date), "Invalid revision date", "metadata");
    requireCondition(new Date(date).toISOString().startsWith(date), "Invalid calendar date", "metadata");
    requireCondition(
        author !== undefined && author.length > 0 && description !== undefined && description.length > 0,
        "Incomplete revision entry",
        "metadata",
    );
}
