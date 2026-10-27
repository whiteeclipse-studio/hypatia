/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it } from "vitest";
import { createCatalogue } from "../catalogue/index.ts";
import { selectLocale } from "../preferences/index.ts";
import { createSession } from "./create-session.ts";

it("applies a selected locale and falls back from region to base language to English", async () => {
    const catalogue = createCatalogue([
        { locale: "en", namespace: "common", messages: { english: "English", title: "Hello" } },
        { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "fr-CA", namespace: "common", messages: { regional: "Québec" } },
    ]);
    const locale = selectLocale(["es-MX", "fr-ca"], catalogue);
    const session = await createSession(catalogue, locale);

    expect(session.isInitialized).toBe(true);
    expect(session.language).toBe("fr-CA");
    expect(session.languages).toEqual(["fr-CA", "fr", "en"]);
    expect(session.t("common:regional")).toBe("Québec");
    expect(session.t("common:title")).toBe("Bonjour");
    expect(session.t("common:english")).toBe("English");
    expect(session.t("common:missing")).toBe("common:missing");
});

it("uses base-language resources when the selected region has no namespace of its own", async () => {
    const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);
    const session = await createSession(catalogue, "fr-CA");

    expect(session.language).toBe("fr-CA");
    expect(session.t("common:title")).toBe("Bonjour");
    expect(session.t("common:missing")).toBe("common:missing");
});

it("defaults to English and displays keys with an empty catalogue", async () => {
    const session = await createSession(createCatalogue([]));

    expect(session.language).toBe("en");
    expect(session.t("common:missing")).toBe("common:missing");
    expect(session.t("missing")).toBe("missing");
});

it("preserves requested keys even when a lookup supplies a default message", async () => {
    const session = await createSession(createCatalogue([]));

    expect(session.t("common:missing", { defaultValue: "A default message" })).toBe("common:missing");
    expect(session.t("missing", "Another default message")).toBe("missing");
    expect(session.t(["common:first", "common:last"], { defaultValue: "Default" })).toBe("common:last");
});

it("keeps real translations when a default is also supplied and resolves ordered fallback keys", async () => {
    const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);
    const session = await createSession(catalogue, "fr");

    expect(session.t("common:title", { defaultValue: "Default" })).toBe("Bonjour");
    expect(session.t(["common:missing", "common:title"])).toBe("Bonjour");
});

it("supports nested namespace paths, interpolation, and plural forms", async () => {
    const catalogue = createCatalogue([
        {
            locale: "en",
            namespace: "blog.article",
            messages: {
                nested: { title: "Article" },
                greeting: "Hello, {{name}}",
                items_one: "One item",
                items_other: "{{count}} items",
            },
        },
    ]);
    const session = await createSession(catalogue);

    expect(session.t("blog.article:nested.title")).toBe("Article");
    expect(session.t("blog.article:greeting", { name: "A & B" })).toBe("Hello, A & B");
    expect(session.t("blog.article:items", { count: 1 })).toBe("One item");
    expect(session.t("blog.article:items", { count: 2 })).toBe("2 items");
});

it("keeps concurrent sessions' languages and resource mutations independent", async () => {
    const catalogue = createCatalogue([
        { locale: "fr", namespace: "common", messages: { nested: { title: "Bonjour" } } },
        { locale: "ja", namespace: "common", messages: { nested: { title: "こんにちは" } } },
    ]);
    const [first, second] = await Promise.all([createSession(catalogue, "fr"), createSession(catalogue, "ja")]);

    expect(first.language).toBe("fr");
    expect(second.language).toBe("ja");

    await first.changeLanguage("en");
    first.addResource("ja", "common", "nested.title", "Changed in first session");
    first.addResource("ja", "common", "extra", "First session only");

    expect(first.language).toBe("en");
    expect(first.t("common:nested.title", { lng: "ja" })).toBe("Changed in first session");
    expect(second.language).toBe("ja");
    expect(second.t("common:nested.title")).toBe("こんにちは");
    expect(second.t("common:extra")).toBe("common:extra");
    expect(catalogue["ja"]?.["common"]).toEqual({ nested: { title: "こんにちは" } });
});

it("keeps fixed-language reads separate from actions on the original session", async () => {
    const catalogue = createCatalogue([
        { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
    ]);
    const session = await createSession(catalogue, "fr");
    const fixedFrench = session.getFixedT("fr", "common");
    const retainedSession = session;

    await session.changeLanguage("ja");

    expect(fixedFrench("title")).toBe("Bonjour");
    expect(session.t("common:title")).toBe("こんにちは");

    await retainedSession.changeLanguage("fr");

    expect(session.language).toBe("fr");
    expect(session.t("common:title")).toBe("Bonjour");
});

it("rejects an invalid initial locale", async () => {
    await expect(createSession(createCatalogue([]), "not_a_locale")).rejects.toThrow("Invalid translation locale");
});
