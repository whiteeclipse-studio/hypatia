/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pageDataUrl, type ProjectIndex } from "./types";


const index: ProjectIndex = {
    project: { id: "example", name: "Example" },
    generation: "fixture-generation",
    entries: [],
    assets: {},
};

test.each([
    ["/example/docs/guide/", "example/docs/guide/index.json"],
    ["/example/docs/français 100%/", "example/docs/français 100%/index.json"],
    ["/", "index.json"],
])("page data for %s resolves after a static server decodes the request URL", async (route, filename) => {
    const root = await mkdtemp(join(tmpdir(), "hypatia-page-data-"));
    try {
        const file = join(root, "_data", index.project.id, index.generation, filename);
        const contents = JSON.stringify({ route, title: "Synthetic page" });
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, contents);
        const request = new URL(encodeURI(pageDataUrl(index, route)), "https://example.test");
        const servedFile = resolve(root, `.${decodeURIComponent(request.pathname)}`);
        expect(request.pathname).not.toMatch(/%2f/i);
        expect(await readFile(servedFile, "utf8")).toBe(contents);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
