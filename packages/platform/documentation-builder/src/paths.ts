/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { requireCondition } from "./errors.ts";
import { hasControls } from "./text.ts";

const omitLast = -1;

/**
 * Checks a canonical archive-relative path, including its URL-decoded spelling.
 *
 * @param path - Archive path, without a query or fragment.
 * @returns The unchanged canonical path.
 * @throws {DocumentationError} When traversal, aliases, or unsafe separators are present.
 */
export function archivePath(path: string): string {
    requireCondition(
        path.length > 0 && !/[\\:%#?]/u.test(path) && !hasControls(path),
        `Unsafe path: ${path}`,
        "unsafe-path",
    );
    const parts = path.split("/");
    requireCondition(parts.every(validSegment), `Noncanonical path: ${path}`, "unsafe-path");
    return path;
}

/**
 * Rejects encoded separators and dot segments rather than accepting platform-dependent aliases.
 *
 * @param part - A single path segment.
 * @returns Whether it is a safe literal filename.
 */
function validSegment(part: string): boolean {
    try {
        const decoded = decodeURIComponent(part);
        return (
            decoded.length > 0 &&
            decoded !== "." &&
            decoded !== ".." &&
            !/[\\/:%?#]/u.test(decoded) &&
            !hasControls(decoded)
        );
    } catch {
        return false;
    }
}

/**
 * Returns the generated HTML path for a Markdown source.
 *
 * @param source - Canonical source path.
 * @returns The corresponding archive-relative output path.
 */
export function htmlPath(source: string): string {
    const parts = source.split("/");
    const name = parts.pop() ?? "";
    parts.push(name === "README.md" ? "index.html" : name.replace(/\.md$/u, ".html"));
    return parts.join("/");
}

/**
 * Finds a parent folder without depending on the host operating system.
 *
 * @param path - A relative path.
 * @returns Parent path, or an empty string for the root.
 */
export function parentPath(path: string): string {
    return path.split("/").slice(0, omitLast).join("/");
}

/**
 * Resolves an authored relative URL inside the artifact root.
 *
 * @param from - Containing page path.
 * @param target - Relative target without query or fragment.
 * @returns A canonical archive path.
 * @throws {DocumentationError} When the reference escapes the artifact or contains unsafe syntax.
 */
export function resolveReference(from: string, target: string): string {
    requireCondition(!target.startsWith("/"), `Absolute artifact reference: ${target}`, "unsafe-link");
    requireCondition(!/%(?:2f|5c|25|2e)/iu.test(target), `Encoded path alias: ${target}`, "unsafe-link");
    const parts = parentPath(from).split("/").filter(Boolean);
    for (const part of target.split("/")) {
        applySegment(parts, decodeURIComponent(part), target);
    }
    return parts.length === 0 ? "" : archivePath(parts.join("/"));
}

/**
 * Applies one literal navigation segment, rejecting attempts to leave the root.
 *
 * @param parts - Current canonical path segments.
 * @param part - Next source segment.
 * @param target - Original reference for diagnostics.
 * @throws {DocumentationError} When parent navigation escapes the root.
 */
function applySegment(parts: string[], part: string, target: string): void {
    if (part === "..") {
        requireCondition(parts.length > 0, `Reference escapes artifact: ${target}`, "unsafe-link");
        parts.pop();
    } else if (part !== "." && part !== "") {
        parts.push(part);
    }
}

/**
 * Produces a URL-safe path without changing its hierarchy.
 *
 * @param path - Validated literal path.
 * @returns An encoded URL path.
 */
export function encodePath(path: string): string {
    return path.split("/").map(encodeURIComponent).join("/");
}

/**
 * Orders paths consistently across operating systems and locales.
 *
 * @param left - First string.
 * @param right - Second string.
 * @returns Their code-point ordering.
 */
export function comparePaths(left: string, right: string): number {
    return left < right ? omitLast : Number(left > right);
}
