/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { loadCatalogue } from "./load-catalogue.ts";

let directory: string;

beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "hypatia-locales-"));
});

afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
});

/**
 * Writes a synthetic translation file within this test's temporary directory.
 *
 * @param path - Relative path below the locales directory.
 * @param source - YAML fixture text.
 * @returns Completion of fixture creation.
 */
async function writeLocale(path: string, source: string): Promise<void> {
    const file = join(directory, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, source);
}

it("loads all languages and derives dotted namespaces from nested YAML paths", async () => {
    await writeLocale("ja/blog/article-1.yaml", "title: 記事\nitems: [一, 二]\n");
    await writeLocale("fr-ca/common.yaml", "title: Allô\n");

    const { catalogue, files } = await loadCatalogue(directory);

    expect(catalogue).toEqual({
        "fr-CA": { common: { title: "Allô" } },
        ja: { "blog.article-1": { title: "記事", items: ["一", "二"] } },
    });
    expect(files).toEqual([join(directory, "fr-ca/common.yaml"), join(directory, "ja/blog/article-1.yaml")]);
    expect(Object.isFrozen(catalogue["ja"]?.["blog.article-1"]?.["items"])).toBe(true);
});

it("allows empty YAML namespaces alongside populated namespaces in the same locale", async () => {
    await writeLocale("fr/empty.yaml", "# Reserved for later\n");
    await writeLocale("fr/common.yaml", "title: Bonjour\n");

    expect((await loadCatalogue(directory)).catalogue["fr"]?.["empty"]).toEqual({});
});

it("rejects a locale containing only empty files even when another locale has messages", async () => {
    await writeLocale("fr/empty.yaml", "");
    await writeLocale("en/common.yaml", "title: Hello\n");

    await expect(loadCatalogue(directory)).rejects.toThrow('Locale "fr" contains no messages');
});

it.each([
    ["fr/blog.article.yaml", "fr/blog/article.yaml"],
    ["iw/common.yaml", "he/common.yaml"],
])("rejects canonical namespace collisions between %s and %s with source paths", async (first, second) => {
    await writeLocale(first, "title: First\n");
    await writeLocale(second, "title: Second\n");

    await expect(loadCatalogue(directory)).rejects.toThrow("Duplicate translation namespace");
    await expect(loadCatalogue(directory)).rejects.toThrow(join(directory, first));
    await expect(loadCatalogue(directory)).rejects.toThrow(join(directory, second));
});

it.each(["title: [", "title: One\ntitle: Two\n"])("rejects malformed or duplicate-key YAML: %s", async source => {
    await writeLocale("en/common.yaml", source);

    await expect(loadCatalogue(directory)).rejects.toThrow(
        `Invalid translations in ${join(directory, "en/common.yaml")}`,
    );
});

it.each(["null", "- item", "title: 42", "title: true", "title: null", "loop: &loop {self: *loop}"])(
    "delegates invalid message data to catalogue validation: %s",
    async source => {
        await writeLocale("en/common.yaml", source);

        await expect(loadCatalogue(directory)).rejects.toThrow();
    },
);

it.each(["common.yaml", "not_a_locale/common.yaml", "fr/.yaml"])(
    "rejects invalid source identities: %s",
    async path => {
        await writeLocale(path, "title: Hello\n");

        await expect(loadCatalogue(directory)).rejects.toThrow();
    },
);

it("allows noncyclic YAML aliases and retains special message keys", async () => {
    await writeLocale("en/common.yaml", "original: &message {title: Hello}\ncopy: *message\n__proto__: Safe\n");

    const { catalogue } = await loadCatalogue(directory);

    expect(catalogue["en"]?.["common"]?.["copy"]).toEqual({ title: "Hello" });
    expect(Object.hasOwn(catalogue["en"]?.["common"] ?? {}, "__proto__")).toBe(true);
});

it("ignores other extensions and symlinks without leaving the translation tree", async () => {
    await writeLocale("en/common.yaml", "title: Hello\n");
    await writeLocale("en/ignored.yml", "title: Ignored\n");
    await symlink(join(directory, "en/common.yaml"), join(directory, "en/linked.yaml"));
    await symlink(join(directory, "en"), join(directory, "fr"));

    const { catalogue, files } = await loadCatalogue(directory);

    expect(Object.keys(catalogue)).toEqual(["en"]);
    expect(files).toEqual([join(directory, "en/common.yaml")]);
});

it("supports an empty tree or initially absent locales directory", async () => {
    expect((await loadCatalogue(directory)).catalogue).toEqual({});
    expect(await loadCatalogue(join(directory, "absent"))).toEqual({ catalogue: {}, files: [] });
});
