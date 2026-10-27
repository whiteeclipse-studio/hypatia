/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { DocumentationPage, GeneratedPageMetadata, SourceFile } from "../types.ts";
import { resolveLimits } from "../limits.ts";
import { processSources, type PipelineInput, type PipelineOutput } from "./pipeline.ts";

const commitLength = 40;

export const history = `| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1 | 2026-10-27 | Fixture author | Initial entry |`;

/**
 * Creates a synthetic authored document with complete metadata.
 *
 * @param path - Virtual source path relative to docs.
 * @param id - Unique fixture identifier.
 * @param notice - Fixture notice Markdown.
 * @param revisions - Fixture revision table.
 * @returns A valid Markdown source.
 */
export function authored(path: string, id: string, notice = "Root notice", revisions = history): SourceFile {
    return {
        path,
        content: new TextEncoder().encode(`---
id: ${id}
standard_revision: 1
---

# ${id}

Fixture article.

## Copyright and licence

${notice}

## Revisions

${revisions}
`),
    };
}

/**
 * Runs the complete source pipeline without a filesystem or Git fixture.
 *
 * @param files - Synthetic Markdown sources.
 * @param generatedPages - Optional generated-page overrides.
 * @param licence - Selected root licence format.
 * @returns The validated artifact and diagnostics.
 */
export async function build(
    files: SourceFile[],
    generatedPages: Record<string, GeneratedPageMetadata> = {},
    licence: PipelineInput["licence"] = "none",
): Promise<PipelineOutput> {
    return processSources({
        files,
        generatedPages,
        licence,
        source: {
            repository: "https://github.com/example/documentation",
            name: "documentation",
            commit: "0".repeat(commitLength),
            dirty: false,
        },
        limits: resolveLimits(),
    });
}

/**
 * Reads a required fixture output page.
 *
 * @param result - Completed pipeline output.
 * @param path - Expected HTML path.
 * @returns The matching manifest entry.
 * @throws {Error} When the expected page is absent.
 */
export function page(result: PipelineOutput, path: string): DocumentationPage {
    const found = result.artifact.manifest.pages.find(entry => entry.path === path);
    if (found === undefined) {
        throw new Error(`Missing fixture output: ${path}`);
    }
    return found;
}
