/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { expect, test } from "bun:test";
import type { Bootstrap, PageData } from "./types";
import { bootstrapSchema, pageSchema } from "./validation";


const page: PageData = {
    route: "/example/docs/guide/",
    title: "Guide",
    directory: false,
    variants: {
        en: {
            title: "Guide",
            tree: { type: "root", children: [] },
            copyrightAndLicence: { type: "root", children: [] },
            revisions: [],
            navigation: {
                parent: "docs/readme.md",
                previous: "docs/introduction.md",
                next: "docs/reference.md",
            },
        },
    },
};

test("bootstrap validation preserves the document navigation rendered by the server", () => {
    const bootstrap: Bootstrap = {
        module: "documentation",
        locale: "en",
        indexes: [],
        page,
        development: false,
    };
    const payload: unknown = JSON.parse(JSON.stringify(bootstrap));
    expect(bootstrapSchema.parse(payload)).toEqual(bootstrap);
});

test("page response validation preserves independently authored navigation fields", () => {
    for (const navigation of [page.variants["en"]?.navigation, { next: "docs/reference.md" }, {}]) {
        const response = structuredClone(page);
        const document = response.variants["en"];
        if (document === undefined) {
            throw new Error("Missing fixture document.");
        }
        document.navigation = navigation;
        const payload: unknown = JSON.parse(JSON.stringify(response));
        expect(pageSchema.parse(payload)).toEqual(response);
    }
});

test("page validation accepts documents without navigation and rejects malformed targets", () => {
    const response = structuredClone(page);
    const document = response.variants["en"];
    if (document === undefined) {
        throw new Error("Missing fixture document.");
    }
    delete document.navigation;
    expect(pageSchema.parse(response)).toEqual(response);
    expect(
        pageSchema.safeParse({
            ...response,
            variants: { en: { ...document, navigation: { next: { path: "docs/reference.md" } } } },
        }).success,
    ).toBe(false);
});
