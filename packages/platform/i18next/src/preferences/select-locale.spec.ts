/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it } from "vitest";
import { createCatalogue } from "../catalogue/index.ts";
import { selectLocale } from "./select-locale.ts";

it.each([
    { preferences: ["ja", "fr"], expected: "ja" },
    { preferences: ["de", "ja"], expected: "de" },
    { preferences: ["es-MX", "fr-CA", "ja"], expected: "fr-CA" },
    { preferences: ["fr-FR", "ja"], expected: "fr-FR" },
    { preferences: ["DE-de"], expected: "de-DE" },
    { preferences: ["not_a_locale", "", "*", "ja"], expected: "ja" },
])("selects $expected from ordered preferences $preferences", ({ preferences, expected }) => {
    const catalogue = createCatalogue([
        { locale: "en", namespace: "common", messages: { title: "Hello" } },
        { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "de", namespace: "common", messages: { title: "Hallo" } },
        { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
    ]);

    expect(selectLocale(preferences, catalogue)).toBe(expected);
});

it("selects an exact regional locale even when its base language is absent", () => {
    const catalogue = createCatalogue([{ locale: "fr-CA", namespace: "common", messages: { title: "Bonjour" } }]);

    expect(selectLocale(["fr-ca"], catalogue)).toBe("fr-CA");
});

it("skips a base language or sibling region when only a different regional locale is available", () => {
    const catalogue = createCatalogue([
        { locale: "fr-CA", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
    ]);

    expect(selectLocale(["fr", "fr-FR", "ja"], catalogue)).toBe("ja");
});

it.each([{ preferences: [] }, { preferences: ["es-MX"] }, { preferences: ["not_a_locale", ""] }])(
    "uses English when no preference resolves, even without English resources: $preferences",
    ({ preferences }) => {
        const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);

        expect(selectLocale(preferences, catalogue)).toBe("en");
    },
);

it("uses English for an entirely empty catalogue", () => {
    expect(selectLocale(["fr-CA", "ja"], createCatalogue([]))).toBe("en");
});

it("does not change the supplied preferences or catalogue", () => {
    const preferences = Object.freeze(["es-MX", "FR-ca"]);
    const catalogue = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);

    expect(selectLocale(preferences, catalogue)).toBe("fr-CA");
    expect(preferences).toEqual(["es-MX", "FR-ca"]);
    expect(catalogue).toEqual({ fr: { common: { title: "Bonjour" } } });
});
