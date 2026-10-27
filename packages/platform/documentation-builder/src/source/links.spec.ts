/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { expect, it } from "bun:test";
import { rejects } from "node:assert/strict";
import { sanitizeHtml } from "../html.ts";
import { authored, build, page } from "./pipeline.fixtures.ts";

it.each(["text", "markdown"] as const)("rewrites repository-root licence links for a %s licence", async licence => {
    const root = authored("README.md", "root", "[Licence](../LICENCE?download=1#terms)");
    root.content = new TextEncoder().encode(
        new TextDecoder().decode(root.content).replace(
            "Fixture article.",
            `[Licence](../LICENCE) [Terms][licence] [[../LICENCE.md|Licence]]

[licence]: ../LICENCE.md#terms`,
        ),
    );
    const result = await build(
        [
            root,
            authored("internal/README.md", "internal", "[Licence](../../LICENCE.md#terms)"),
            authored("internal/nested/topic.md", "topic"),
            licence === "markdown"
                ? authored("LICENCE.md", "licence")
                : { path: "LICENCE.md", content: new TextEncoder().encode("Fixture licence") },
        ],
        {},
        licence,
    );

    const article = new TextDecoder().decode(result.artifact.files.get("index.html"));
    expect(article).toContain('href="LICENCE.html"');
    expect(article).toContain('href="LICENCE.html#terms"');
    expect(page(result, "index.html").copyrightAndLicence).toContain('href="LICENCE.html?download=1#terms"');
    expect(page(result, "internal/index.html").copyrightAndLicence).toContain('href="../LICENCE.html#terms"');
    expect(page(result, "internal/nested/index.html").copyrightAndLicence).toContain('href="../../LICENCE.html#terms"');
    if (licence === "text") {
        expect(page(result, "LICENCE.html").copyrightAndLicence).toContain('href="LICENCE.html?download=1#terms"');
    }
    expect(result.diagnostics).toEqual([]);
});

it("requires an imported root licence even when docs contains a licence page", async () => {
    await rejects(
        build([authored("README.md", "root", "[Licence](../LICENCE)"), authored("LICENCE.md", "local-licence")]),
        { code: "unsafe-link" },
    );
});

it.each([
    "../private.md",
    "../../LICENCE",
    "../LICENCE/secret",
    "../LICENCE.html",
    "/LICENCE",
    "../%2e/LICENCE",
    "../LICENCE%2fsecret",
    "..%5cLICENCE",
])("still rejects unsafe source references with an imported licence: %s", async target => {
    await rejects(
        build(
            [
                authored("README.md", "root", `[Unsafe](${target})`),
                { path: "LICENCE.md", content: new TextEncoder().encode("Fixture licence") },
            ],
            {},
            "text",
        ),
        { code: "unsafe-link" },
    );
});

it("keeps artifact HTML confined even for root licence references", () => {
    expect(() => sanitizeHtml('<a href="../LICENCE">Licence</a>', "index.html")).toThrow(/Reference escapes artifact/u);
});
