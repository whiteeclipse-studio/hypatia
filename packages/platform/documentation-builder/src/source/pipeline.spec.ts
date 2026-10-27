/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { expect, it } from "bun:test";
import { rejects } from "node:assert/strict";
import type { DocumentationPage, GeneratedPageMetadata, SourceFile } from "../types.ts";
import { resolveLimits } from "../limits.ts";
import { parseHtml } from "../html.ts";
import { nodeText } from "../history.ts";
import { processSources, type PipelineInput, type PipelineOutput } from "./pipeline.ts";

const history = `| Revision | Date | Author | Description |
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
function authored(path: string, id: string, notice = "Root notice", revisions = history): SourceFile {
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
async function build(
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
            commit: "0".repeat(40),
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
function page(result: PipelineOutput, path: string): DocumentationPage {
    const found = result.artifact.manifest.pages.find(entry => entry.path === path);
    if (found === undefined) {
        throw new Error(`Missing fixture output: ${path}`);
    }
    return found;
}

it("inherits disclosures from the nearest authored README with independent relative links", async () => {
    const localHistory = `${history}\n| 2 | 2026-10-27 | Fixture author | Local update |`;
    const result = await build([
        authored("README.md", "root", "Root notice [terms](./terms.md) [summary](#root)"),
        authored("terms.md", "terms"),
        authored("internal/README.md", "internal", "Local notice [terms](../terms.md)", localHistory),
        authored("internal/notes/deep/topic.md", "deep-topic"),
        authored("internal/other/topic.md", "other-topic"),
        authored("public/topic.md", "public-topic"),
    ]);

    for (const path of ["internal/notes/index.html", "internal/notes/deep/index.html", "internal/other/index.html"]) {
        const generated = page(result, path);
        expect(generated.generated).toBe(true);
        expect(generated.copyrightAndLicence).toContain("Local notice");
        expect(generated.revisions).toBe(page(result, "internal/index.html").revisions);
        expect(generated.revision).toBe(2);
    }
    expect(page(result, "internal/notes/index.html").copyrightAndLicence).toContain('href="../../terms.html"');
    expect(page(result, "internal/notes/deep/index.html").copyrightAndLicence).toContain('href="../../../terms.html"');
    expect(page(result, "internal/other/index.html").copyrightAndLicence).toContain('href="../../terms.html"');
    expect(page(result, "public/index.html").copyrightAndLicence).toContain("Root notice");
    expect(page(result, "public/index.html").copyrightAndLicence).toContain('href="../index.html#root"');
    expect(page(result, "public/index.html").revision).toBe(1);
    expect(page(result, "index.html").copyrightAndLicence).toContain('href="terms.html"');
    expect(page(result, "index.html").copyrightAndLicence).toContain('href="#root"');
    expect(result.diagnostics).toEqual([]);
});

it("derives stable, distinct IDs and readable titles without reusing a README identity", async () => {
    const files = [
        authored("README.md", "root"),
        authored("getting-started/topic.md", "first-topic"),
        authored("reference/topic.md", "second-topic"),
    ];
    const first = await build(files);
    const second = await build([...files].reverse());

    expect(first.artifact.manifest).toEqual(second.artifact.manifest);
    expect(page(first, "getting-started/index.html").title).toBe("Getting started");
    expect(page(first, "getting-started/index.html").id).not.toBe("root");
    expect(page(first, "getting-started/index.html").id).not.toBe(page(first, "reference/index.html").id);
    expect(page(first, "index.html").generated).toBe(false);
});

it("applies partial overrides independently and resolves configured links from the generated folder", async () => {
    const linkedHistory = history.replace("Initial entry", "[Initial entry](./terms.md)");
    const result = await build(
        [
            authored("README.md", "root", "Root notice", linkedHistory),
            authored("terms.md", "terms"),
            authored("reference/topic.md", "topic"),
            authored("guides/topic.md", "guide-topic"),
        ],
        {
            "reference/index.html": {
                id: "custom-reference",
                title: "Reference overview",
                copyrightAndLicence: "Custom notice [terms](../terms.md)",
            },
            "guides/index.html": { revisions: history },
        },
    );

    const reference = page(result, "reference/index.html");
    expect(reference.id).toBe("custom-reference");
    expect(reference.title).toBe("Reference overview");
    expect(reference.copyrightAndLicence).toContain("Custom notice");
    expect(reference.copyrightAndLicence).toContain('href="../terms.html"');
    expect(reference.revisions).toContain('href="../terms.html"');
    expect(page(result, "guides/index.html").copyrightAndLicence).toContain("Root notice");
    expect(page(result, "guides/index.html").revisions).not.toContain("href=");
    expect(result.diagnostics).toEqual([]);
});

it.each(["text", "markdown"] as const)("uses docs/README.md disclosures for a %s root licence", async licence => {
    const result = await build(
        [
            authored("README.md", "root"),
            { path: "LICENCE.md", content: new TextEncoder().encode("Fixture licence <script>inert</script>") },
        ],
        {},
        licence,
    );

    const generated = page(result, "LICENCE.html");
    const root = page(result, "index.html");
    expect(generated.copyrightAndLicence).toBe(root.copyrightAndLicence);
    expect(generated.revisions).toBe(root.revisions);
    expect(generated.id).not.toBe(root.id);
    expect(generated.title).toBe("Licence");
    expect(generated.generated).toBe(true);
    if (licence === "text") {
        const html = new TextDecoder().decode(result.artifact.files.get("LICENCE.html"));
        expect(parseHtml(html).children.map(nodeText).join("")).toContain("Fixture licence <script>inert</script>");
        expect(html).not.toContain("<script>");
    }
});

it("keeps explicit licence overrides while inheriting omitted fields", async () => {
    const result = await build(
        [authored("README.md", "root"), { path: "LICENCE.md", content: new TextEncoder().encode("Fixture licence") }],
        { "LICENCE.html": { id: "custom-licence", title: "Project licence", revisions: history } },
        "text",
    );

    expect(page(result, "LICENCE.html").id).toBe("custom-licence");
    expect(page(result, "LICENCE.html").title).toBe("Project licence");
    expect(page(result, "LICENCE.html").copyrightAndLicence).toBe(page(result, "index.html").copyrightAndLicence);
});

it("preserves authored licence metadata instead of applying generated-page defaults", async () => {
    const result = await build(
        [authored("README.md", "root"), authored("LICENCE.md", "authored-licence", "Authored licence notice")],
        { "LICENCE.html": { id: "unused-override" } },
        "markdown",
    );

    expect(page(result, "LICENCE.html").id).toBe("authored-licence");
    expect(page(result, "LICENCE.html").generated).toBe(false);
    expect(page(result, "LICENCE.html").copyrightAndLicence).toContain("Authored licence notice");
});

it("requires explicit disclosures when no ancestor README exists", async () => {
    const files = [authored("topic.md", "topic")];
    await rejects(build(files), /generatedPages\["index\.html"\]\.copyrightAndLicence/u);
    await rejects(
        build(files, { "index.html": { copyrightAndLicence: "Configured notice" } }),
        /generatedPages\["index\.html"\]\.revisions/u,
    );

    const result = await build(files, {
        "index.html": { copyrightAndLicence: "Configured notice", revisions: history },
    });
    expect(page(result, "index.html").title).toBe("Documentation");
    expect(page(result, "index.html").generated).toBe(true);
});

it("rejects invalid explicit metadata instead of hiding it with inherited defaults", async () => {
    const files = [authored("README.md", "root"), authored("reference/topic.md", "topic")];
    await rejects(
        build(files, { "reference/index.html": { revisions: "1" } }),
        /Exactly one revision table is required/u,
    );
    await rejects(build(files, { "reference/index.html": { title: "" } }), /Expected a nonempty string/u);
});
