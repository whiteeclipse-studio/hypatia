/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it } from "vitest";
import { createCatalogue } from "./catalogue.ts";

it("allows an entirely empty catalogue", () => {
    const catalogue = createCatalogue([]);

    expect(catalogue).toEqual({});
    expect(Object.isFrozen(catalogue)).toBe(true);
});

it("collects serializable, incomplete translations and normalizes regional locale identifiers", () => {
    const catalogue = createCatalogue([
        { locale: "fr-ca", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "fr-CA", namespace: "empty", messages: {} },
        { locale: "ja", namespace: "blog.article-1", messages: { title: "記事", tags: ["資料", { name: "参照" }] } },
    ]);

    expect(catalogue).toEqual({
        "fr-CA": { common: { title: "Bonjour" }, empty: {} },
        ja: { "blog.article-1": { title: "記事", tags: ["資料", { name: "参照" }] } },
    });

    const transported: unknown = JSON.parse(JSON.stringify(catalogue));
    expect(transported).toEqual(catalogue);
});

it.each([{}, { section: {} }, { sections: [] }, { sections: [{ items: [] }, {}] }])(
    "rejects a locale containing only empty message containers: %j",
    (messages: unknown) => {
        expect(() => createCatalogue([{ locale: "fr", namespace: "common", messages }])).toThrow(
            'Locale "fr" contains no messages',
        );
    },
);

it("validates message presence separately for each locale", () => {
    expect(() =>
        createCatalogue([
            { locale: "fr", namespace: "common", messages: {} },
            { locale: "fr", namespace: "another-empty-file", messages: { section: {} } },
            { locale: "ja", namespace: "common", messages: { title: "資料" } },
        ]),
    ).toThrow('Locale "fr" contains no messages');
});

it("distinguishes a declared empty-string message from an empty namespace", () => {
    expect(createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "" } }])).toEqual({
        fr: { common: { title: "" } },
    });
});

it("rejects duplicate canonical locale–namespace pairs rather than merging or overwriting", () => {
    expect(() =>
        createCatalogue([
            { locale: "fr-ca", namespace: "blog.article", messages: { title: "One" } },
            { locale: "fr-CA", namespace: "blog.article", messages: { title: "Two" } },
        ]),
    ).toThrow('Duplicate translation namespace "blog.article" for locale "fr-CA"');
});

it("does not change when caller-owned messages are mutated", () => {
    const messages = { section: { title: "Bonjour" }, list: ["Un"] };
    const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages }]);

    messages.section.title = "Changed";
    messages.list.push("Deux");

    expect(Object.isFrozen(messages)).toBe(false);
    expect(catalogue["fr"]?.["common"]).toEqual({ section: { title: "Bonjour" }, list: ["Un"] });
});

it("freezes the catalogue, namespace groups, nested messages, and lists", () => {
    const catalogue = createCatalogue([
        { locale: "fr", namespace: "common", messages: { section: { title: "Bonjour" }, list: ["Un"] } },
    ]);

    const namespaces = catalogue["fr"];
    const messages = namespaces?.["common"];

    if (namespaces === undefined || messages === undefined) {
        throw new Error("Missing fixture messages");
    }

    expect(Reflect.set(catalogue, "ja", {})).toBe(false);
    expect(Reflect.set(namespaces, "other", {})).toBe(false);
    expect(Reflect.set(messages, "title", "Changed")).toBe(false);

    const section = messages["section"];
    const list = messages["list"];

    if (typeof section !== "object" || typeof list !== "object") {
        throw new Error("Missing nested fixture messages");
    }

    expect(Reflect.set(section, "title", "Changed")).toBe(false);
    expect(Reflect.set(list, "0", "Changed")).toBe(false);
});

it.each([
    { messages: null },
    { messages: "Root string" },
    { messages: [] },
    { messages: { title: null } },
    { messages: { title: false } },
    { messages: { title: 1 } },
    { messages: { title: undefined } },
    { messages: { title: new Date(0) } },
])("rejects unsupported message data: %j", (fixture: { messages: unknown }) => {
    expect(() => createCatalogue([{ locale: "fr", namespace: "common", messages: fixture.messages }])).toThrow(
        TypeError,
    );
});

it("rejects circular messages and accepts non-cyclic shared references", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic["self"] = cyclic;

    expect(() => createCatalogue([{ locale: "fr", namespace: "common", messages: cyclic }])).toThrow(
        "circular references",
    );

    const shared = { title: "Bonjour" };
    const catalogue = createCatalogue([
        { locale: "fr", namespace: "common", messages: { first: shared, second: shared } },
    ]);

    expect(catalogue["fr"]?.["common"]?.["first"]).toEqual(shared);
    expect(catalogue["fr"]?.["common"]?.["first"]).not.toBe(shared);
});

it("rejects invalid locale and empty namespace identifiers", () => {
    expect(() =>
        createCatalogue([{ locale: "not_a_locale", namespace: "common", messages: { title: "Hello" } }]),
    ).toThrow("Invalid translation locale");

    expect(() => createCatalogue([{ locale: "fr", namespace: "", messages: { title: "Bonjour" } }])).toThrow(
        "Empty translation namespace",
    );
});
