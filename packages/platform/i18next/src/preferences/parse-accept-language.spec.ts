/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it } from "vitest";
import { createCatalogue } from "../catalogue/index.ts";
import { selectLocale } from "./select-locale.ts";
import { createSession } from "../session/index.ts";
import { parseAcceptLanguage } from "./parse-accept-language.ts";

it("keeps unweighted preferences in their original order and trims whitespace", () => {
    expect(parseAcceptLanguage(" fr-CA , de, ja ")).toEqual(["fr-CA", "de", "ja"]);
});

it("orders preferences by quality, treating omitted weights as one", () => {
    expect(parseAcceptLanguage("fr;q=0.7, ja;q=1, de;q=0.9, en")).toEqual(["ja", "en", "de", "fr"]);
});

it("preserves header order for equal weights", () => {
    expect(parseAcceptLanguage("de;q=0.8,fr;q=0.800,ja;q=0.8")).toEqual(["de", "fr", "ja"]);
});

it("supports case-insensitive quality parameters and surrounding whitespace", () => {
    expect(parseAcceptLanguage("fr ; Q = 0.8, ja ; q=1.000")).toEqual(["ja", "fr"]);
});

it("ignores zero-quality entries, including decimal zero values", () => {
    expect(parseAcceptLanguage("fr;q=0,ja;q=0.0,de;q=0.000,en")).toEqual(["en"]);
});

it("accepts boundary weights and the HTTP decimal precision", () => {
    expect(parseAcceptLanguage("fr;q=0.001,de;q=1.000,ja;q=0.,en;q=1.")).toEqual(["de", "en", "fr"]);
});

it.each(["", "invalid", "-0.1", "1.1", ".8", "0.1234", "01", "1e0", "1.001", "NaN", "Infinity"])(
    "skips a range with invalid quality %j rather than giving it the default weight",
    quality => {
        expect(parseAcceptLanguage(`fr;q=${quality},ja`)).toEqual(["ja"]);
    },
);

it("rejects unknown, duplicate, and extra parameters", () => {
    expect(parseAcceptLanguage("fr;level=1,de;q=0.7;q=0.8,en;;q=1,ja")).toEqual(["ja"]);
});

it.each([{ header: undefined }, { header: null }, { header: "" }, { header: " , , \t " }])(
    "returns no preferences for an absent or empty header: $header",
    ({ header }) => {
        expect(parseAcceptLanguage(header)).toEqual([]);
    },
);

it("leaves locale validation and canonicalization to the shared selection policy", () => {
    const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);
    const preferences = parseAcceptLanguage("not_a_locale, *;q=0.9, FR-ca;q=0.8");

    expect(preferences).toEqual(["not_a_locale", "*", "FR-ca"]);
    expect(selectLocale(preferences, catalogue)).toBe("fr-CA");
});

it.each([{ header: null }, { header: "es-MX" }, { header: "*" }, { header: "fr;q=0" }])(
    "defaults to English when no supported request preference resolves: $header",
    async ({ header }) => {
        const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);
        const locale = selectLocale(parseAcceptLanguage(header), catalogue);
        const session = await createSession(catalogue, locale);

        expect(session.language).toBe("en");
        expect(session.t("common:title")).toBe("common:title");
    },
);

it("initializes independent sessions from concurrent request headers", async () => {
    const catalogue = createCatalogue([
        { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
    ]);
    const frenchLocale = selectLocale(parseAcceptLanguage("es,fr-CA;q=0.8,ja;q=0.1"), catalogue);
    const japaneseLocale = selectLocale(parseAcceptLanguage("ja,fr;q=0.5"), catalogue);
    const [french, japanese] = await Promise.all([
        createSession(catalogue, frenchLocale),
        createSession(catalogue, japaneseLocale),
    ]);

    expect(french.language).toBe("fr-CA");
    expect(french.t("common:title")).toBe("Bonjour");
    expect(japanese.language).toBe("ja");
    expect(japanese.t("common:title")).toBe("こんにちは");

    await french.changeLanguage("en");

    expect(japanese.language).toBe("ja");
    expect(japanese.t("common:title")).toBe("こんにちは");
});
